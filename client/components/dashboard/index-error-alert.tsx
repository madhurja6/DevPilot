"use client";

import { useState } from "react";
import { AlertCircle, ChevronDown } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

const SUMMARY_LIMIT = 100;

function getErrorSummary(message: string) {
    const line = message.split("\n").find((part) => part.trim())?.trim() || message;
    if (line.length <= SUMMARY_LIMIT) return line;
    return `${line.slice(0, SUMMARY_LIMIT - 1)}...`;
}

export function IndexErrorAlert({ message }: { message: string }) {
    const [open, setOpen] = useState(false);
    const summary = getErrorSummary(message);
    const isExpandable = message.trim().length > summary.length;

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="w-full">
            <Alert variant="destructive" className="relative pr-10">
                <AlertCircle className="size-4" />
                <AlertTitle>Indexing Failed</AlertTitle>
                <AlertDescription className="mt-1">
                    {open ? (
                        <pre className="mt-2 whitespace-pre-wrap break-all rounded bg-destructive/10 p-2 text-xs font-mono">
                            {message}
                        </pre>
                    ) : (
                        <span className="break-all">{summary}</span>
                    )}
                </AlertDescription>

                {isExpandable && (
                    <CollapsibleTrigger
                        render={
                            <button
                                onClick={() => setOpen(!open)}
                                className="absolute right-3 top-3 rounded-md p-1 hover:bg-destructive/20 transition-colors"
                                aria-label={open ? "Collapse error" : "Expand error"}
                            />
                        }
                    >
                        <ChevronDown
                            className={cn(
                                "size-4 transition-transform duration-200",
                                open && "rotate-180"
                            )}
                        />
                    </CollapsibleTrigger>
                )}
            </Alert>
        </Collapsible>
    );
}