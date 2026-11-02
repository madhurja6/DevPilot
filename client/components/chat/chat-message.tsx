"use client";

import { useEffect, useRef } from "react";
import { Bot, User, Loader2 } from "lucide-react";
import { ChatMarkdown } from "./chat-markdown";
import type { ChatMessage } from "@/lib/api";
import { cn } from "@/lib/utils";

export function ChatMessages({
    messages,
    isStreaming,
    streamingContent,
}: {
    messages: ChatMessage[];
    isStreaming: boolean;
    streamingContent: string;
}) {
    const bottomRef = useRef<HTMLDivElement>(null);

    // Auto-scroll when messages change or content streams
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, streamingContent]);

    if (messages.length === 0 && !isStreaming) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <Bot className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">How can I help you today?</h3>
                <p className="max-w-sm text-sm text-muted-foreground">
                    Ask me anything about the codebase. I can explain logic, find bugs, or write new features.
                </p>
            </div>
        );
    }

    return (
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 pt-8 pb-32">
            {messages.map((message) => (
                <div
                    key={message.id}
                    className={cn(
                        "flex gap-4",
                        message.role === "USER" ? "justify-end" : "justify-start"
                    )}
                >
                    {message.role === "ASSISTANT" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                            <Bot className="h-5 w-5 text-primary" />
                        </div>
                    )}

                    <div
                        className={cn(
                            "rounded-xl px-5 py-3.5 text-sm max-w-[85%]",
                            message.role === "USER"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted/50"
                        )}
                    >
                        {message.role === "USER" ? (
                            <p className="whitespace-pre-wrap">{message.content}</p>
                        ) : (
                            <ChatMarkdown content={message.content} />
                        )}
                    </div>

                    {message.role === "USER" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted border">
                            <User className="h-5 w-5" />
                        </div>
                    )}
                </div>
            ))}

            {/* Streaming indicator / text */}
            {isStreaming && (
                <div className="flex gap-4 justify-start">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="rounded-xl bg-muted/50 px-5 py-3.5 text-sm max-w-[85%]">
                        {streamingContent ? (
                            <ChatMarkdown content={streamingContent} />
                        ) : (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Thinking...</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div ref={bottomRef} className="h-4" />
        </div>
    );
}