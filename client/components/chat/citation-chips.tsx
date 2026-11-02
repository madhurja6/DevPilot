"use client";

import { FileCode2, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type Citation = {
    id: string;
    title: string;
    url?: string;
    metadata?: string; // e.g., "Line 42" or "src/components/button.tsx"
};

export function CitationChips({
    citations,
    className,
}: {
    citations: Citation[];
    className?: string;
}) {
    if (!citations || citations.length === 0) return null;

    return (
        <div className={cn("mt-4 flex flex-wrap items-center gap-2", className)}>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Sources:
            </span>
            {citations.map((citation, index) => {
                const isLink = Boolean(citation.url);

                const ChipWrapper = isLink ? "a" : "div";
                const wrapperProps = isLink
                    ? { href: citation.url, target: "_blank", rel: "noopener noreferrer" }
                    : {};

                return (
                    <ChipWrapper
                        key={citation.id || index}
                        {...wrapperProps}
                        className={cn(
                            "group flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1 text-xs font-medium shadow-sm transition-all",
                            isLink && "hover:border-primary/50 hover:bg-primary/5 hover:text-primary cursor-pointer"
                        )}
                    >
                        {isLink ? (
                            <Link2 className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                        ) : (
                            <FileCode2 className="h-3.5 w-3.5 text-muted-foreground" />
                        )}

                        <span className="truncate max-w-[150px]">
                            {citation.title}
                        </span>

                        {citation.metadata && (
                            <>
                                <span className="text-border">|</span>
                                <span className="text-muted-foreground truncate max-w-[100px]">
                                    {citation.metadata}
                                </span>
                            </>
                        )}
                    </ChipWrapper>
                );
            })}
        </div>
    );
}