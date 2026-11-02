"use client";

import Link from "next/link";
import {
    AlertCircle,
    CheckCircle2,
    FolderGit2,
    LoaderCircle,
} from "lucide-react";

import { RepoCard } from "@/components/dashboard/repo-card";
import { Button, buttonVariants } from "@/components/ui/button"; // Import buttonVariants
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useRepos } from "@/hooks/use-repos";
import { cn } from "@/lib/utils";

function StatCard({
    label,
    value,
    icon: Icon,
    description,
}: {
    label: string;
    value: string | number;
    icon: React.ElementType;
    description: string;
}) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">{label}</CardTitle>
                <Icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export function OverviewDashboard() {
    const { data: repos, isLoading } = useRepos();

    const totalRepos = repos?.length || 0;
    const readyRepos = repos?.filter((r) => r.indexStatus === "INDEXED").length || 0;
    const indexingRepos = repos?.filter((r) => r.indexStatus === "INDEXING").length || 0;
    const failedRepos = repos?.filter((r) => r.indexStatus === "FAILED").length || 0;

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full" />
                    ))}
                </div>
                <Skeleton className="w-full" style={{ height: 400 }} />
            </div>
        );
    }

    return (
        <div className="space-y-8 p-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Overview</h2>
                <p className="text-muted-foreground">
                    A summary of your connected repositories and their indexing status.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    label="Total Repositories"
                    value={totalRepos}
                    icon={FolderGit2}
                    description="Connected to DevPilot"
                />
                <StatCard
                    label="Ready to Chat"
                    value={readyRepos}
                    icon={CheckCircle2}
                    description="Successfully indexed"
                />
                <StatCard
                    label="Currently Indexing"
                    value={indexingRepos}
                    icon={LoaderCircle}
                    description="Processing in background"
                />
                <StatCard
                    label="Failed Indexing"
                    value={failedRepos}
                    icon={AlertCircle}
                    description="Require attention"
                />
            </div>

            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Recent Repositories</h3>  
                    <Link
                        href="/dashboard"
                        className={cn(
                            buttonVariants({ variant: "ghost", size: "sm" }),
                            "text-sm text-primary hover:bg-primary/10"
                        )}
                    >
                        View all
                    </Link>
                </div>

                {repos && repos.length > 0 ? (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {repos.slice(0, 3).map((repo) => (
                            <RepoCard key={repo.id} repo={repo} />
                        ))}
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center p-12 text-center">
                        <FolderGit2 className="size-10 text-muted-foreground mb-4" />
                        <CardTitle className="mb-2">No repositories found</CardTitle>
                        <CardDescription>
                            Connect your GitHub account to start indexing repositories.
                        </CardDescription>
                    </Card>
                )}
            </div>
        </div>
    );
}