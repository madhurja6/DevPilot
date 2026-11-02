import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { GitHubIcon } from "@/components/icons/github-icon";
import Link from "next/link";
import {
  Terminal,
  Database,
  MessageSquare,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col font-sans selection:bg-emerald-500/30">

      {/* Header */}
      <header className="flex h-20 items-center justify-between px-6 lg:px-12 border-b border-border/40">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <Terminal className="size-4" />
          </div>
          <span className="text-xl font-bold tracking-tight">DevPilot</span>
        </div>
        <div className="flex items-center gap-4">
          <ModeToggle />
          {/* FIX 1: Added nativeButton={false} */}
          <Button
            render={<Link href="/login" />}
            nativeButton={false}
            variant="ghost"
            className="font-semibold text-sm"
          >
            Sign in
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 lg:py-32">

        {/* Hero Section */}
        <div className="max-w-3xl text-center space-y-8 flex flex-col items-center">

          {/* Center Logo */}
          <div className="flex size-20 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20">
            <Terminal className="size-10" />
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
            DevPilot
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance">
            Connect GitHub, index any repository, and chat with your codebase using retrieval-augmented answers and citations.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            {/* FIX 2: Added nativeButton={false} */}
            <Button
              render={<Link href="/login" />}
              nativeButton={false}
              size="lg"
              className="bg-pink-600 hover:bg-pink-700 text-white gap-2 rounded-md px-6 h-12"
            >
              <GitHubIcon className="size-5" />
              Continue with GitHub
              <ArrowRight className="size-4 ml-1" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-md px-6 h-12">
              See how it works
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl w-full mt-24">

          {/* Card 1 */}
          <div className="flex flex-col p-8 rounded-2xl bg-card border border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-6">
              <GitHubIcon className="size-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Connect GitHub</h3>
            <p className="text-muted-foreground leading-relaxed">
              OAuth with repo scope for public and private repositories.
            </p>
          </div>

          {/* Card 2 */}
          <div className="flex flex-col p-8 rounded-2xl bg-card border border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-6">
              <Database className="size-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Index with RAG</h3>
            <p className="text-muted-foreground leading-relaxed">
              Chunk and embed your code into Postgres + pgvector.
            </p>
          </div>

          {/* Card 3 */}
          <div className="flex flex-col p-8 rounded-2xl bg-card border border-border/50 hover:bg-card/80 transition-colors">
            <div className="flex size-12 items-center justify-center rounded-xl bg-muted mb-6">
              <MessageSquare className="size-6 text-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-3">Ask anything</h3>
            <p className="text-muted-foreground leading-relaxed">
              Get grounded answers with clickable citations.
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}