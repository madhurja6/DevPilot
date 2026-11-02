"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ChatComposer({
    onSend,
    onStop,
    isStreaming,
    disabled,
}: {
    onSend: (content: string) => void;
    onStop: () => void;
    isStreaming: boolean;
    disabled: boolean;
}) {
    const [input, setInput] = useState("");
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Auto-resize textarea
    useEffect(() => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }, [input]);

    const handleSend = () => {
        if (!input.trim() || isStreaming || disabled) return;
        onSend(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="absolute bottom-0 left-0 w-full bg-linear-to-t from-background via-background to-transparent px-4 pt-10 pb-6">
            <div className="mx-auto max-w-3xl relative flex items-end gap-2 rounded-2xl border bg-background p-2 shadow-sm focus-within:ring-1 focus-within:ring-ring">
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a question about your code..."
                    className="max-h-50 min-h-11 w-full resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                    rows={1}
                    disabled={disabled || isStreaming}
                />

                {isStreaming ? (
                    <Button
                        size="icon"
                        variant="secondary"
                        className="h-10 w-10 shrink-0 rounded-xl"
                        onClick={onStop}
                    >
                        <Square className="h-4 w-4 fill-current" />
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        className={cn(
                            "h-10 w-10 shrink-0 rounded-xl transition-all",
                            input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground opacity-50"
                        )}
                        onClick={handleSend}
                        disabled={!input.trim() || disabled}
                    >
                        <ArrowUp className="h-5 w-5" />
                    </Button>
                )}
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground">
                AI can make mistakes. Consider verifying important information.
            </div>
        </div>
    );
}