"use client";

import { useRouter } from "next/navigation";
import {
    ArrowRight,
    ExternalLink,
    GitBranch,
    Lock,
    MessageSquare,
    RotateCcw,
    Sparkles,
} from "lucide-react";

import { IndexErrorAlert } from "@/components/dashboard/index-error-alert";
import { LanguageBadge } from "@/components/dashboard/language-badge";
import { IndexStatusBadge } from "@/components/dashboard/repo-status";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { getRepoProgress, useStartIndexing } from "@/hooks/use-repos";
import type { Repository } from "@/lib/api";

export function RepoCard({ repo }: { repo: Repository }) {
    const router = useRouter();
    const startIndexing = useStartIndexing();

    const isIndexing = repo.indexStatus === "INDEXING";
    const isReady = repo.indexStatus === "INDEXED";
    const isFailed = repo.indexStatus === "FAILED";

    const progress = getRepoProgress(repo);

    const handleChat = () => {
        router.push(`/chat/${repo.id}`);
    };

    const handleIndex = () => {
        startIndexing.mutate(repo.id);
    };

    return (
        <div className="flex flex-col rounded-xl border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md">
            <div className="flex flex-col space-y-1.5 p-6 pb-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <div className="flex size-8 items-center justify-center rounded-md bg-muted">
                            {repo.isPrivate ? (
                                <Lock className="size-4 text-muted-foreground" />
                            ) : (
                                <GitBranch className="size-4 text-muted-foreground" />
                            )}
                        </div>
                        <div>
                            <h3 className="font-semibold leading-none tracking-tight">
                                {repo.name}
                            </h3>
                            <p className="mt-1 text-xs text-muted-foreground line-clamp-1">
                                {repo.description || "No description provided."}
                            </p>
                        </div>
                    </div>
                    <IndexStatusBadge status={repo.indexStatus} />
                </div>
            </div>

            <div className="flex flex-1 flex-col justify-end p-6 pt-0 gap-4">
                <div className="flex items-center justify-between">
                    <LanguageBadge language={repo.language} />
                    <a
                        href={repo.htmlUrl || undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                    >
                        GitHub <ExternalLink className="size-3" />
                    </a>
                </div>

                {isIndexing && (
                    <div className="space-y-2 pt-2">
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5">
                                <Spinner className="size-3" /> Indexing codebase...
                            </span>
                            <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5" />
                    </div>
                )}

                {isFailed && repo.errorMessage && (
                    <div className="pt-2">
                        <IndexErrorAlert message={repo.errorMessage} />
                    </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                    {isReady ? (
                        <Button onClick={handleChat} className="w-full gap-2" size="sm">
                            <MessageSquare className="size-4" />
                            Chat with Repo
                            <ArrowRight className="size-4 ml-auto" />
                        </Button>
                    ) : isFailed ? (
                        <Button
                            onClick={handleIndex}
                            disabled={startIndexing.isPending}
                            variant="outline"
                            className="w-full gap-2"
                            size="sm"
                        >
                            {startIndexing.isPending ? (
                                <Spinner className="size-4" />
                            ) : (
                                <RotateCcw className="size-4" />
                            )}
                            Retry Indexing
                        </Button>
                    ) : (
                        <Button
                            onClick={handleIndex}
                            disabled={isIndexing || startIndexing.isPending}
                            // Added Pink styling to match your screenshot
                            className="w-full gap-2 bg-pink-600 hover:bg-pink-700 text-white"
                            size="sm"
                        >
                            {isIndexing || startIndexing.isPending ? (
                                <Spinner className="size-4" />
                            ) : (
                                <Sparkles className="size-4" />
                            )}
                            {isIndexing ? "Indexing..." : "Index Repo"}
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}