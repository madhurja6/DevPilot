"use client";
import {
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";

import { api, type ChatMessage } from "@/lib/api";
import { queryKeys } from "@/lib/query-keys";
import { streamChatMessage } from "@/lib/stream-chat";
import { toast } from "@/components/ui/toast";

// ─────────────────────────────────────────────────────────────
// Chat Sessions
// ─────────────────────────────────────────────────────────────
export function useChatSessions(repositoryId: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.chat.sessions(repositoryId),
        queryFn: () => api.listSessions(repositoryId),
        enabled: Boolean(repositoryId) && enabled,
    });
}

export function useCreateChatSession(repositoryId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (title?: string) =>
            api.createSession(repositoryId, title ?? "New Chat"),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.sessions(repositoryId),
            });
            toast.add({
                title: "Chat session created",
                type: "success",
            });
        },
        onError: (error: Error) => {
            toast.add({
                title: "Failed to create chat session",
                description: error.message,
                type: "error",
            });
        },
    });
}

export function useDeleteChatSession(repositoryId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (sessionId: string) => api.deleteSession(sessionId),
        onSuccess: (_, sessionId) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.chat.sessions(repositoryId),
            });
            queryClient.removeQueries({
                queryKey: queryKeys.chat.messages(sessionId),
            });
            toast.add({
                title: "Chat session deleted",
                type: "success",
            });
        },
        onError: (error: Error) => {
            toast.add({
                title: "Failed to delete chat session",
                description: error.message,
                type: "error",
            });
        },
    });
}

// ─────────────────────────────────────────────────────────────
// Chat Messages
// ─────────────────────────────────────────────────────────────
export function useChatMessages(sessionId: string | null) {
    return useQuery({
        queryKey: queryKeys.chat.messages(sessionId ?? ""),
        queryFn: () => api.getMessages(sessionId!),
        enabled: Boolean(sessionId),
    });
}

// ─────────────────────────────────────────────────────────────
// Streaming chat message (core hook)
// ─────────────────────────────────────────────────────────────
export function useStreamChatMessage(sessionId: string | null) {
    const queryClient = useQueryClient();
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");
    const abortRef = useRef<AbortController | null>(null);

    const stop = useCallback(() => {
        abortRef.current?.abort();
        abortRef.current = null;
        setIsStreaming(false);
    }, []);

    const send = useCallback(
        async (content: string) => {
            if (!sessionId) {
                toast.add({
                    title: "No active chat session",
                    type: "error",
                });
                return;
            }
            if (!content.trim()) return;

            // cancel any in-flight stream
            abortRef.current?.abort();
            const controller = new AbortController();
            abortRef.current = controller;

            setIsStreaming(true);
            setStreamingContent("");

            const messagesKey = queryKeys.chat.messages(sessionId);

            // Optimistically add the user message to the cache
            queryClient.setQueryData<ChatMessage[]>(messagesKey, (old = []) => [
                ...old,
                {
                    id: `temp-user-${Date.now()}`,
                    role: "USER",
                    content,
                    citations: [],
                    createdAt: new Date().toISOString(),
                },
            ]);

            try {
                await streamChatMessage(sessionId, content, {
                    signal: controller.signal,

                    onUserMessage: (message) => {
                        // Replace the temporary user message with the server one
                        queryClient.setQueryData<ChatMessage[]>(
                            messagesKey,
                            (old = []) => {
                                const withoutTemp = old.filter(
                                    (m) => !m.id.startsWith("temp-user-")
                                );
                                return [...withoutTemp, message];
                            }
                        );
                    },

                    onToken: (token) => {
                        setStreamingContent((prev) => prev + token);
                    },

                    onAssistantMessage: (message) => {
                        queryClient.setQueryData<ChatMessage[]>(
                            messagesKey,
                            (old = []) => [...old, message]
                        );
                        setStreamingContent("");
                    },

                    onDone: () => {
                        setIsStreaming(false);
                        setStreamingContent("");
                        // Ensure final list is fresh from server
                        queryClient.invalidateQueries({
                            queryKey: messagesKey,
                        });
                    },

                    onError: (error) => {
                        setIsStreaming(false);
                        setStreamingContent("");
                        toast.add({
                            title: "Failed to stream message",
                            description: error.message,
                            type: "error",
                        });
                        // Refresh to drop the optimistic user message
                        queryClient.invalidateQueries({
                            queryKey: messagesKey,
                        });
                    },
                });
            } catch (error) {
                setIsStreaming(false);
                setStreamingContent("");
                if ((error as Error).name !== "AbortError") {
                    toast.add({
                        title: "Failed to send message",
                        description:
                            error instanceof Error
                                ? error.message
                                : "Failed to send message",
                        type: "error",
                    });
                }
                queryClient.invalidateQueries({ queryKey: messagesKey });
            } finally {
                abortRef.current = null;
            }
        },
        [sessionId, queryClient]
    );

    return {
        send,
        stop,
        isStreaming,
        streamingContent,
    };
}

// ─────────────────────────────────────────────────────────────
// Convenience hook — everything a chat view needs
// ─────────────────────────────────────────────────────────────
export function useChat(repositoryId: string, sessionId: string | null) {
    const sessionsQuery = useChatSessions(repositoryId);
    const activeSessionId = sessionId ?? sessionsQuery.data?.[0]?.id ?? null;
    const messagesQuery = useChatMessages(activeSessionId);
    const { send, stop, isStreaming, streamingContent } =
        useStreamChatMessage(activeSessionId);
    const createSession = useCreateChatSession(repositoryId);
    const deleteSession = useDeleteChatSession(repositoryId);

    return {
        // sessions
        sessions: sessionsQuery.data ?? [],
        isLoadingSessions: sessionsQuery.isLoading,
        sessionsError: sessionsQuery.error as Error | null,
        activeSessionId,
        createSession,
        deleteSession,

        // messages
        messages: messagesQuery.data ?? [],
        isLoadingMessages: messagesQuery.isLoading,
        messagesError: messagesQuery.error as Error | null,

        // streaming
        send,
        stop,
        isStreaming,
        streamingContent,
    };
}