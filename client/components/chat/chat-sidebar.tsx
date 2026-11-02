"use client";

import { MessageSquarePlus, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ChatSession } from "@/lib/api";

export function ChatSidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewSession,
    isCreating,
}: {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewSession: () => void;
    isCreating: boolean;
}) {
    return (
        <div className="flex h-full w-64 shrink-0 flex-col border-r bg-muted/10">
            <div className="flex h-14 items-center border-b px-4">
                <Button
                    variant="outline"
                    className="w-full justify-start gap-2 rounded-lg"
                    onClick={onNewSession}
                    disabled={isCreating}
                >
                    <MessageSquarePlus className="h-4 w-4" />
                    {isCreating ? "Creating..." : "New Chat"}
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {sessions.length === 0 && (
                    <p className="p-4 text-center text-xs text-muted-foreground">
                        No previous chats.
                    </p>
                )}

                {sessions.map((session) => (
                    <button
                        key={session.id}
                        onClick={() => onSelectSession(session.id)}
                        className={cn(
                            "group flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm text-left transition-colors",
                            activeSessionId === session.id
                                ? "bg-muted font-medium text-foreground"
                                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                    >
                        <div className="flex items-center gap-2 truncate">
                            <MessageSquare className="h-4 w-4 shrink-0" />
                            <span className="truncate">{session.title || "Untitled Chat"}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}