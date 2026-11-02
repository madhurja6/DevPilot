"use client";

import { AlertCircle, Loader2, RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Progress } from "@/components/ui/progress";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repos";
import type { IndexStatusResponse, Repository } from "@/lib/api";

export function IndexingState({
    repo,
    status,
}: {
    repo: Repository;
    status?: IndexStatusResponse;
}) {
    const indexMutation = useStartIndexing();

    const filesProcessed = status?.filesProcessed ?? repo.filesProcessed ?? 0;
    const filesTotal = status?.filesTotal ?? repo.filesTotal ?? 0;
    const chunkCount = status?.chunkCount ?? repo.chunkCount ?? 0;

    const progress = getRepoProgress({
        filesProcessed,
        filesTotal,
    });

    const indexStatus = status?.status ?? repo.indexStatus;
    const errorMessage = status?.errorMessage ?? repo.errorMessage;

    // ─────────────────────────────────────────────────────────────
    // FAILED STATE
    // ─────────────────────────────────────────────────────────────
    if (indexStatus === "FAILED") {
        return (
            <div className="flex h-full w-full items-center justify-center p-6">
                <Empty className="max-w-md border-0">
                    <EmptyHeader>
                        <EmptyMedia
                            variant="icon"
                            className="bg-destructive/10 text-destructive"
                        >
                            <AlertCircle className="h-6 w-6" />
                        </EmptyMedia>
                        <EmptyTitle className="text-xl">Indexing failed</EmptyTitle>
                        <EmptyDescription className="text-balance">
                            {errorMessage ||
                                "Something went wrong while indexing this repository. Please try again."}
                        </EmptyDescription>
                    </EmptyHeader>
                    <Button
                        onClick={() => indexMutation.mutate(repo.id)}
                        disabled={indexMutation.isPending}
                        className="mt-4"
                    >
                        {indexMutation.isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <RotateCcw className="mr-2 h-4 w-4" />
                        )}
                        {indexMutation.isPending ? "Retrying..." : "Retry indexing"}
                    </Button>
                </Empty>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────
    // LOADING / INDEXING STATE
    // ─────────────────────────────────────────────────────────────
    const isPreparing = filesTotal === 0;

    return (
        <div className="flex h-full w-full items-center justify-center p-6">
            <Empty className="max-w-md border-0">
                <EmptyHeader>
                    <EmptyMedia
                        variant="icon"
                        className="bg-primary/10 text-primary"
                    >
                        {isPreparing ? (
                            <Sparkles className="h-6 w-6 animate-pulse" />
                        ) : (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        )}
                    </EmptyMedia>
                    <EmptyTitle className="text-xl">
                        Indexing <span className="text-primary">{repo.fullName}</span>
                    </EmptyTitle>
                    <EmptyDescription>
                        {isPreparing
                            ? "Fetching repository files and preparing embeddings..."
                            : `${filesProcessed.toLocaleString()} of ${filesTotal.toLocaleString()} files · ${chunkCount.toLocaleString()} chunks embedded`}
                    </EmptyDescription>
                </EmptyHeader>

                <div className="mt-6 w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                            <span>Progress</span>
                            <span>{isPreparing ? "Initializing..." : `${progress}%`}</span>
                        </div>
                        <Progress
                            value={isPreparing ? 12 : progress}
                            className="h-2 w-full"
                        />
                    </div>

                    <p className="text-center text-xs text-muted-foreground/80 leading-relaxed">
                        You can safely leave this page open.
                        <br />
                        Chat will unlock automatically once indexing finishes.
                    </p>
                </div>
            </Empty>
        </div>
    );
}