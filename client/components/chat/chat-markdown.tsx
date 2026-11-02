"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import "./chat-markdown.css";

export function ChatMarkdown({
    content,
    className,
}: {
    content: string;
    className?: string;
}) {
    return (
        <div className={cn("chat-markdown wrap-break-word text-foreground", className)}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                    // You can add custom components here if needed
                    // For example, customizing links to open in a new tab:
                    a: (anchorProps) => {
                        const { node, ...props } = anchorProps;
                        void node;
                        return (
                            <a {...props} target="_blank" rel="noopener noreferrer" />
                        );
                    },
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}