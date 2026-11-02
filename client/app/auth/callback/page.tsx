"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useCurrentUser } from "@/hooks/use-auth";
import { Spinner } from "@/components/ui/spinner";

export default function AuthCallbackPage() {
    const router = useRouter();
    const { data: user, isLoading, isFetched } = useCurrentUser();

    useEffect(() => {
        if (!isFetched || isLoading) return;

        if (user) {
            router.replace("/dashboard");
            return;
        }
        router.replace("/login?error=session");

    }, [user, isLoading, isFetched, router]);

    return (
        <div className="flex min-h-svh flex-col items-center justify-center gap-2">
            <Spinner className="size-6" />
            <p className="text-sm text-muted-foreground">Finishing GitHub Sign in...</p>
        </div>
    );
}