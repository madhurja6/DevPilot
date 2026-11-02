"use client";

import { useState, useEffect } from "react";
import { ChatSidebar } from "./chat-sidebar";
import { ChatMessages } from "./chat-message";
import { ChatComposer } from "./chat-composer";
import { IndexingState } from "./indexing-state";
import { useChat } from "@/hooks/use-chat";
import { useIndexStatus, useRepository } from "@/hooks/use-repos";
import { Spinner } from "@/components/ui/spinner";

export function ChatView({ repoId }: { repoId: string }) {
  const repoQuery = useRepository(repoId);
  const statusQuery = useIndexStatus(
    repoId,
    repoQuery.data?.indexStatus === "INDEXING"
  );
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const {
    sessions,
    activeSessionId: selectedSessionId,
    createSession,
    messages,
    send,
    stop,
    isStreaming,
    streamingContent,
    isLoadingSessions
  } = useChat(repoId, activeSessionId);

  const repo = repoQuery.data;

  useEffect(() => {
    if (
      repo?.indexStatus === "INDEXED" &&
      !isLoadingSessions &&
      sessions.length === 0 &&
      !createSession.isPending &&
      !activeSessionId
    ) {
      createSession.mutate("New Chat", {
        onSuccess: (newSession) => {
          setActiveSessionId(newSession.id);
        }
      });
    }
  }, [repo?.indexStatus, sessions, isLoadingSessions, activeSessionId, createSession]);

  if (repoQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
        <Spinner className="size-4" />
        Loading repository...
      </div>
    );
  }

  if (repoQuery.error || !repo) {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-destructive">
        {repoQuery.error instanceof Error
          ? repoQuery.error.message
          : "Repository could not be loaded."}
      </div>
    );
  }

  if (repo.indexStatus === "INDEXING") {
    return <IndexingState repo={repo} status={statusQuery.data} />;
  }

  if (repo.indexStatus !== "INDEXED") {
    return (
      <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
        This repository is not indexed yet. Start indexing it from the repositories dashboard before chatting.
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-background">
      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        activeSessionId={selectedSessionId}
        onSelectSession={setActiveSessionId}
        onNewSession={() => {
          createSession.mutate("New Chat", {
            onSuccess: (newSession) => {
              setActiveSessionId(newSession.id);
            },
          });
        }}
        isCreating={createSession.isPending}
      />

      {/* Main Chat Area */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-14 items-center border-b px-6 bg-background/95 backdrop-blur z-10 shrink-0">
          <h2 className="text-sm font-medium">
            {selectedSessionId
              ? sessions.find(s => s.id === selectedSessionId)?.title || "Chat Session"
              : "Loading..."}
          </h2>
        </header>

        <div className="flex-1 overflow-y-auto">
          {selectedSessionId ? (
            <ChatMessages
              messages={messages}
              isStreaming={isStreaming}
              streamingContent={streamingContent}
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
              <p>Initializing chat session...</p>
            </div>
          )}
        </div>

        <ChatComposer
          onSend={send}
          onStop={stop}
          isStreaming={isStreaming}
          disabled={!selectedSessionId}
        />
      </div>
    </div>
  );
}