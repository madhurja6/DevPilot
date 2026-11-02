package devPilot.backend.services.ai;

public final class RagSettings {
    public static final int TOP_K_CHUNKS = 8;


    public static final long STREAM_TIMEOUT_MS = 180_000L;

    /**
     * Metadata key stored on each embedded document (must match {@link devPilot.backend.service.indexing.CodeChunker}).
     */

    public static final String METADATA_REPO_ID = "repoId";

    private RagSettings() {
    }
}
