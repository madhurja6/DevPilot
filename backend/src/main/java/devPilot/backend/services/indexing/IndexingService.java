package devPilot.backend.services.indexing;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.ai.document.Document;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.ai.vectorstore.filter.FilterExpressionBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.entity.IndexingStatus;
import devPilot.backend.entity.Repository;
import devPilot.backend.exceptions.NotFoundException;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.UserService;
import devPilot.backend.services.ai.RagSettings;
import devPilot.backend.services.github.GithubApiClient;
import devPilot.backend.services.github.GithubRateLimiter;
import lombok.extern.slf4j.Slf4j;

//4:11:55

@Service
@Slf4j
public class IndexingService {
    private static final int VECTOR_BATCH_SIZE = 32;
    private static final int PROGRESS_EVERY_N_FILES = 5;

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;
    private final CodeFileFilter fileFilter;
    private final CodeChunker codeChunker;
    private final GithubRateLimiter rateLimiter;
    private final VectorStore vectorStore;

    @Value("${app.indexing.max-file-bytes:102400}")
    private long maxFileBytes;

    public IndexingService(
            RepositoryRepository repositoryRepository,
            UserService userService,
            GithubApiClient gitHubApiClient,
            CodeFileFilter fileFilter,
            CodeChunker codeChunker,
            GithubRateLimiter rateLimiter,
            VectorStore vectorStore) {
        this.repositoryRepository = repositoryRepository;
        this.userService = userService;
        this.gitHubApiClient = gitHubApiClient;
        this.fileFilter = fileFilter;
        this.codeChunker = codeChunker;
        this.rateLimiter = rateLimiter;
        this.vectorStore = vectorStore;
    }

    /**
     * Initializes indexing status before the asynchronous process starts.
     */
    public void startIndexing(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        // Set initial status immediately
        updateProgress(repo.getId(), 0, 0, 0, IndexingStatus.INDEXING, null);

    }

    @Async("indexingExecutor")
    public void indexAsync(UUID repoId, UUID userId) {
        try {
            doIndex(repoId, userId);
        } catch (Exception ex) {
            log.error("Indexing failed for repo {}", repoId, ex);
            markFailed(repoId, ex.getMessage());
        }
    }

    private void doIndex(UUID repoId, UUID userId) {
        Repository repo = repositoryRepository.findById(repoId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));

        String token = userService.decryptAccessToken(userService.requiredById(userId));

        // 1. Clear existing vectors for this repo
        deleteExistingVectors(repoId.toString());

        // 2. Fetch repository tree
        rateLimiter.pause();
        Map<String, Object> tree = gitHubApiClient.getRepoTree(
                token, repo.getOwner(), repo.getName(), repo.getDefaultBranch());

        if (tree == null || Boolean.TRUE.equals(tree.get("truncated"))) {
            throw new IllegalStateException("GitHub repository tree is missing or truncated");
        }

        List<String> filePaths = listIndexableFiles(tree);
        updateProgress(repoId, filePaths.size(), 0, 0, IndexingStatus.INDEXING, null);

        List<Document> batch = new ArrayList<>();
        int processed = 0;
        int totalChunks = 0;

        // 3. Process files
        for (String path : filePaths) {
            try {
                rateLimiter.pause();
                String content = gitHubApiClient.getFileContent(
                        token, repo.getOwner(), repo.getName(), path);

                if (content != null && !content.isBlank()) {
                    List<Document> chunks = codeChunker.chunkFile(repoId.toString(), path, content);
                    batch.addAll(chunks);
                    totalChunks += chunks.size();

                    if (batch.size() >= VECTOR_BATCH_SIZE) {
                        vectorStore.add(batch);
                        batch.clear();
                    }
                }
            } catch (Exception ex) {
                log.warn("Skipping file {} in {}: {}", path, repo.getFullName(), ex.getMessage());
            }

            processed++;
            // Update DB periodically to show progress
            if (processed % PROGRESS_EVERY_N_FILES == 0 || processed == filePaths.size()) {
                updateProgress(repoId, filePaths.size(), processed, totalChunks, IndexingStatus.INDEXING, null);
            }
        }

        // 4. Flush remaining documents
        if (!batch.isEmpty()) {
            vectorStore.add(batch);
        }

        // 5. Mark as complete
        markReady(repoId, filePaths.size(), processed, totalChunks, repo.getFullName());
    }

    @SuppressWarnings("unchecked")
    private List<String> listIndexableFiles(Map<String, Object> tree) {
        if (tree == null || tree.get("tree") == null) {
            return List.of();
        }

        List<Map<String, Object>> entries = (List<Map<String, Object>>) tree.get("tree");
        return entries.stream()
                .filter(entry -> "blob".equals(String.valueOf(entry.get("type"))))
                .filter(entry -> {
                    String path = String.valueOf(entry.get("path"));
                    long size = entry.get("size") instanceof Number n ? n.longValue() : 0L;
                    return fileFilter.isEligible(path, size, maxFileBytes);
                })
                .map(entry -> String.valueOf(entry.get("path")))
                .toList();
    }

    private void deleteExistingVectors(String repoId) {
        try {
            var filter = new FilterExpressionBuilder().eq(RagSettings.METADATA_REPO_ID, repoId).build();
            vectorStore.delete(filter);
        } catch (Exception ex) {
            log.warn("Could not delete existing vectors for repo {}: {}", repoId, ex.getMessage());
        }
    }

    @Transactional
    protected void updateProgress(
            UUID repoId,
            int total,
            int processed,
            int chunks,
            IndexingStatus status,
            String error) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setFilesTotal(total);
            repo.setFilesProcessed(processed);
            repo.setChunkCount(chunks);
            repo.setIndexingStatus(status);
            repo.setErrorMessage(error);
            repositoryRepository.save(repo);
        });
    }

    @Transactional
    protected void markReady(UUID repoId, int totalFiles, int processedFiles, int totalChunks, String fullName) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexingStatus(IndexingStatus.INDEXED); // Use INDEXED or READY based on your enum
            repo.setFilesTotal(totalFiles);
            repo.setFilesProcessed(processedFiles);
            repo.setChunkCount(totalChunks);
            repo.setIndexedAt(Instant.now());
            repo.setErrorMessage(null);
            repositoryRepository.save(repo);
            log.info("Indexed {} files ({} chunks) for {}", processedFiles, totalChunks, fullName);
        });
    }

    @Transactional
    protected void markFailed(UUID repoId, String message) {
        repositoryRepository.findById(repoId).ifPresent(repo -> {
            repo.setIndexingStatus(IndexingStatus.FAILED);
            String safeMessage = (message != null && message.length() > 2000)
                    ? message.substring(0, 2000)
                    : message;
            repo.setErrorMessage(safeMessage);
            repositoryRepository.save(repo);
        });
    }
}