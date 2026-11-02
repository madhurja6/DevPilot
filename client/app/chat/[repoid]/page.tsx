import { Suspense } from "react";

import { ChatView } from "@/components/chat/chat-view";
import { RequireAuth } from "@/components/providers/require-auth";

function ChatPageLoading() {
    return (
        <div className="flex min-h-svh items-center justify-center bg-background text-muted-foreground">
            Loading workspace...
        </div>
    );
}

async function ChatPageContent({
    params,
}: {
    params: Promise<{ repoid: string }>;
}) {
    const { repoid } = await params;

    return (
        <RequireAuth>
            <ChatView repoId={repoid} />
        </RequireAuth>
    );
}

export default function ChatPage({
    params,
}: {
    params: Promise<{ repoid: string }>;
}) {
    return (
        <Suspense fallback={<ChatPageLoading />}>
            <ChatPageContent params={params} />
        </Suspense>
    );
}