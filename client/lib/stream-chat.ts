import { getApiBaseUrl, type ChatMessage } from "@/lib/api";

export type StreamChatHandlers = {
    onUserMessage?: (message: ChatMessage) => void;
    onToken?: (token: string) => void;
    onAssistantMessage?: (message: ChatMessage) => void;
    onDone?: () => void;
    onError?: (error: Error) => void;
    signal?: AbortSignal;
};

export async function streamChatMessage(
    sessionId: string,
    content: string,
    handlers: StreamChatHandlers = {}
): Promise<void> {
    const res = await fetch(
        `${getApiBaseUrl()}/api/chats/sessions/${sessionId}/messages`,
        {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content }),
            signal: handlers.signal,
        }
    );

    if (!res.ok) {
        const body = await res.text();
        let message = body;

        try {
            const errorBody = JSON.parse(body) as { message?: string; error?: string };
            message = errorBody.message ?? errorBody.error ?? body;
        } catch {
            // The server may return a plain-text error body.
        }

        throw new Error(message || `Chat request failed (${res.status})`);
    }

    if (!res.body) {
        throw new Error("No response body for SSE stream");
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let completed = false;

    const processEvent = (rawEvent: string) => {
        const lines = rawEvent.split(/\r?\n/);
        let event = "message";
        const dataLines: string[] = [];

        for (const line of lines) {
            if (line.startsWith("event:")) {
                event = line.slice(6).trim();
            } else if (line.startsWith("data:")) {
                dataLines.push(line.slice(5).replace(/^ /, ""));
            }
        }

        if (dataLines.length === 0) return;

        const data = dataLines.join("\n");

        try {
            if (event === "token") {
                let token: string;
                try {
                    token = JSON.parse(data) as string;
                } catch {
                    token = data;
                }
                handlers.onToken?.(token);
            } else if (event === "user_message") {
                handlers.onUserMessage?.(JSON.parse(data) as ChatMessage);
            } else if (event === "assistant_message") {
                handlers.onAssistantMessage?.(JSON.parse(data) as ChatMessage);
            } else if (event === "error") {
                handlers.onError?.(new Error(data));
            } else if (event === "done") {
                completed = true;
                handlers.onDone?.();
            }
        } catch (err) {
            handlers.onError?.(
                err instanceof Error ? err : new Error("Failed to parse SSE data")
            );
        }
    };

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        let separatorIndex: number;
        while ((separatorIndex = buffer.search(/\r?\n\r?\n/)) !== -1) {
            const event = buffer.slice(0, separatorIndex);
            const separator = buffer.match(/\r?\n\r?\n/)?.[0] ?? "\n\n";
            buffer = buffer.slice(separatorIndex + separator.length);
            processEvent(event);
        }
    }

    buffer += decoder.decode();
    if (buffer.trim()) processEvent(buffer);
    if (!completed) handlers.onDone?.();
}