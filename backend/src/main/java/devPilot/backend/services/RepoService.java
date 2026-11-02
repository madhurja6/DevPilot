package devPilot.backend.services;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import devPilot.backend.dto.IndexStatusResponse;
import devPilot.backend.dto.RepositoryResponse;
import devPilot.backend.entity.Repository;
import devPilot.backend.entity.User;
import devPilot.backend.exceptions.NotFoundException;
import devPilot.backend.repository.RepositoryRepository;
import devPilot.backend.services.github.GithubApiClient;
import lombok.RequiredArgsConstructor;

//3:16:21

@Service
@RequiredArgsConstructor
public class RepoService {

    private final RepositoryRepository repositoryRepository;
    private final UserService userService;
    private final GithubApiClient gitHubApiClient;

    @Transactional(readOnly = true)
    public List<RepositoryResponse> listStored(UUID userId) {
        return repositoryRepository.findByUserIdOrderByFullNameAsc(userId).stream()
                .map(RepositoryResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public Repository requireOwned(UUID repoId, UUID userId) {
        return repositoryRepository.findByIdAndUserId(repoId, userId)
                .orElseThrow(() -> new NotFoundException("Repository not found"));
    }

    @Transactional(readOnly = true)
    public IndexStatusResponse status(UUID repoId, UUID userId) {
        Repository repo = requireOwned(repoId, userId);
        return new IndexStatusResponse(
                repo.getId(),
                repo.getIndexingStatus(),
                repo.getFilesTotal(),
                repo.getFilesProcessed(),
                repo.getChunkCount(),
                repo.getIndexedAt(),
                repo.getErrorMessage());
    }

    @Transactional
    public List<RepositoryResponse> syncAndListRepo(UUID userId) {
        User user = userService.requiredById(userId);
        String token = userService.decryptAccessToken(user);
        List<Map<String, Object>> remoteRepos = gitHubApiClient.listUserRepos(token);

        List<Repository> saved = new ArrayList<>();

        for (Map<String, Object> remote : remoteRepos) {

            Long githubRepoId = toLong(remote.get("id"));

            Repository repo = repositoryRepository
                    .findByUserIdAndGithubRepoId(userId, githubRepoId)
                    .orElseGet(Repository::new);

            String fullName = String.valueOf(remote.get("full_name"));
            String[] parts = fullName.split("/", 2);

            repo.setUserId(userId);
            repo.setGithubRepoId(githubRepoId);
            repo.setFullName(fullName);

            repo.setOwner(
                    parts.length > 0 ? parts[0] : null);

            repo.setName(
                    parts.length > 1
                            ? parts[1]
                            : String.valueOf(remote.get("name")));

            repo.setPrivate(Boolean.TRUE.equals(remote.get("private")));

            repo.setDefaultBranch(
                    remote.get("default_branch") != null
                            ? String.valueOf(remote.get("default_branch"))
                            : "main");

            repo.setLanguage(
                    remote.get("language") != null
                            ? String.valueOf(remote.get("language"))
                            : null);

            repo.setHtmlUrl(
                    remote.get("html_url") != null
                            ? String.valueOf(remote.get("html_url"))
                            : null);

            repo.setDescription(
                    remote.get("description") != null
                            ? String.valueOf(remote.get("description"))
                            : null);

            repo.setUpdatedAt(Instant.now());

            if (repo.getOwner() == null || repo.getOwner().isBlank()) {
                Object ownerObj = remote.get("owner");

                if (ownerObj instanceof Map<?, ?> ownerMap
                        && ownerMap.get("login") != null) {
                    repo.setOwner(String.valueOf(ownerMap.get("login")));
                }
            }

            saved.add(repositoryRepository.save(repo));
        }

        return saved.stream()
                .sorted((a, b) -> a.getFullName().compareToIgnoreCase(b.getFullName()))
                .map(RepositoryResponse::from)
                .toList();
    }

    private static Long toLong(Object value) {
        if (value instanceof Number number) {
            return number.longValue();
        }

        if (value == null) {
            throw new IllegalArgumentException(
                    "GitHub repository ID cannot be null");
        }

        return Long.parseLong(String.valueOf(value));
    }
}