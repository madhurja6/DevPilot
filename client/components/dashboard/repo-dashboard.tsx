"use client";

import { useMemo, useState } from "react";
import { FolderGit2 } from "lucide-react";

import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { RepoCard } from "@/components/dashboard/repo-card";
import { Button } from "@/components/ui/button";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefreshRepos, useRepos } from "@/hooks/use-repos";
import type { IndexStatus } from "@/lib/api";

type FilterStatus = "ALL" | IndexStatus;

export function RepoDashboard() {
    const reposQuery = useRepos();
    const refresh = useRefreshRepos();

    const [search, setSearch] = useState("");
    const [visibility, setVisibility] = useState<"all" | "public" | "private">("all");
    const [status, setStatus] = useState<FilterStatus>("ALL");

    const filteredRepos = useMemo(() => {
        let result = reposQuery.data || [];

        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter(
                (repo) =>
                    repo.name.toLowerCase().includes(lowerSearch) ||
                    repo.description?.toLowerCase().includes(lowerSearch)
            );
        }

        if (visibility !== "all") {
            const isPrivate = visibility === "private";
            result = result.filter((repo) => repo.isPrivate === isPrivate);
        }

        if (status !== "ALL") {
            result = result.filter((repo) => repo.indexStatus === status);
        }

        return result;
    }, [reposQuery.data, search, visibility, status]);

    const totalCount = reposQuery.data?.length || 0;
    const readyCount = reposQuery.data?.filter((r) => r.indexStatus === "INDEXED").length || 0;

    return (
        <div className="flex flex-col h-full">
            <DashboardHeader
                search={search}
                onSearchChange={setSearch}
                visibility={visibility}
                onVisibilityChange={setVisibility}
                status={status}
                onStatusChange={setStatus}
                totalCount={totalCount}
                readyCount={readyCount}
                onSync={() => refresh.mutate()}
                // Fixed: Only show syncing spinner for manual refresh or initial load, 
                // not for background polling every 2 seconds.
                isSyncing={refresh.isPending || reposQuery.isLoading}
            />

            <div className="flex-1 p-6">
                {reposQuery.isLoading ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton key={i} className="w-full rounded-xl" style={{ height: 280 }} />
                        ))}
                    </div>
                ) : filteredRepos.length > 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {filteredRepos.map((repo, index) => (
                            <RepoCard
                                key={`${repo.id}-${repo.name}-${index}`}
                                repo={repo}
                            />
                        ))}
                    </div>
                ) : (
                    <Empty className="h-full border-dashed">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <FolderGit2 />
                            </EmptyMedia>
                            <EmptyTitle>No repositories found</EmptyTitle>
                            <EmptyDescription>
                                {totalCount === 0
                                    ? "You haven't connected any repositories yet. Sync your GitHub account to get started."
                                    : "No repositories match your current search or filters."}
                            </EmptyDescription>
                        </EmptyHeader>
                        {totalCount === 0 && (
                            <Button onClick={() => refresh.mutate()} disabled={refresh.isPending}>
                                Sync Repositories
                            </Button>
                        )}
                    </Empty>
                )}
            </div>
        </div>
    );
}