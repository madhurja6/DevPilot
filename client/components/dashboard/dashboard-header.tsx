"use client";

import { RefreshCw, Search } from "lucide-react";

import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import type { IndexStatus } from "@/lib/api";

type FilterStatus = "ALL" | IndexStatus;

type DashboardHeaderProps = {
    search: string;
    onSearchChange: (value: string) => void;
    visibility: "all" | "public" | "private";
    onVisibilityChange: (value: "all" | "public" | "private") => void;
    status: FilterStatus;
    onStatusChange: (value: FilterStatus) => void;
    totalCount?: number;
    readyCount?: number;
    onSync: () => void;
    isSyncing?: boolean;
};

export function DashboardHeader({
    search,
    onSearchChange,
    visibility,
    onVisibilityChange,
    status,
    onStatusChange,
    totalCount = 0,
    readyCount = 0,
    onSync,
    isSyncing = false,
}: DashboardHeaderProps) {
    return (
        <header className="flex flex-col gap-4 border-b px-4 py-4 md:px-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <Separator orientation="vertical" className="h-6" />
                    <div>
                        <h1 className="text-lg font-semibold tracking-tight">Repositories</h1>
                        <p className="text-xs text-muted-foreground">
                            {readyCount} of {totalCount} repositories ready
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />
                    <Button variant="outline" size="sm" onClick={onSync} disabled={isSyncing}>
                        <RefreshCw className={cn("mr-2 size-4", isSyncing && "animate-spin")} />
                        {isSyncing ? "Syncing..." : "Sync Repos"}
                    </Button>
                </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:max-w-xs">
                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search repositories..."
                        className="w-full pl-8"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Visibility Filter */}
                    <div className="flex rounded-md border p-1 bg-muted/50">
                        {(["all", "public", "private"] as const).map((v) => (
                            <button
                                key={v}
                                onClick={() => onVisibilityChange(v)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors",
                                    visibility === v
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {v}
                            </button>
                        ))}
                    </div>

                    {/* Status Filter */}
                    <div className="flex rounded-md border p-1 bg-muted/50">
                        {(["ALL", "INDEXED", "INDEXING", "FAILED", "PENDING"] as const).map((s) => (
                            <button
                                key={s}
                                onClick={() => onStatusChange(s)}
                                className={cn(
                                    "px-3 py-1 text-xs font-medium rounded-sm capitalize transition-colors",
                                    status === s
                                        ? "bg-background text-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {s === "ALL" ? "All" : s === "INDEXED" ? "Ready" : s.toLowerCase().replace("_", " ")}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </header>
    );
}