"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";

import { DevPilotIcon } from "@/components/icons/devpilot-icon";
import { useSidebar as useDashboardSidebar } from "@/components/providers/sidebar-provider";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

import {
    dashboardNavGroups,
    isDashboardNavActive,
} from "@/lib/dashboard-nav";
import { cn } from "@/lib/utils";

type AppShellProps = {
    children: React.ReactNode;
    title?: string;
    description?: string;
    actions?: React.ReactNode;
    hideHeader?: boolean;
};

export function AppShell({
    children,
    title,
    description,
    actions,
    hideHeader = false,
}: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { isOpen, open, close } = useDashboardSidebar();
    const { data: user } = useCurrentUser();
    const logout = useLogout();

    const username =
        user?.displayName ||
        user?.githubUsername ||
        "User";

    const avatarUrl = user?.avatarUrl;

    const initials = username
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    async function handleLogout() {
        try {
            await logout.mutateAsync();
            router.replace("/login");
            router.refresh();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <SidebarProvider
            open={isOpen}
            onOpenChange={(isOpen) => (isOpen ? open() : close())}
        >
            <Sidebar variant="inset" collapsible="offcanvas">
                <SidebarHeader>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton
                                size="lg"
                                render={<Link href="/dashboard" />}
                                tooltip="DevPilot"
                            >
                                <DevPilotIcon className="size-8 rounded-[10px]" />

                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        DevPilot
                                    </span>
                                    <span className="truncate text-xs text-muted-foreground">
                                        Chat with your code
                                    </span>
                                </div>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    {dashboardNavGroups.map((group) => (
                        <SidebarGroup key={group.label}>
                            <SidebarGroupLabel>
                                {group.label}
                            </SidebarGroupLabel>

                            <SidebarMenu>
                                {group.items.map((item) => {
                                    const isActive =
                                        isDashboardNavActive(
                                            pathname,
                                            item.href
                                        );

                                    const Icon = item.icon;

                                    return (
                                        <SidebarMenuItem key={item.href}>
                                            <SidebarMenuButton
                                                isActive={isActive}
                                                tooltip={item.title}
                                                render={
                                                    <Link href={item.href} />
                                                }
                                            >
                                                <Icon className="size-4" />
                                                <span>{item.title}</span>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    );
                                })}
                            </SidebarMenu>
                        </SidebarGroup>
                    ))}
                </SidebarContent>

                <SidebarFooter>
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <DropdownMenu>
                                <DropdownMenuTrigger
                                    render={
                                        <SidebarMenuButton
                                            size="lg"
                                            tooltip="Account menu"
                                        />
                                    }
                                >
                                    <Avatar className="size-8 rounded-lg">
                                        {avatarUrl && (
                                            <AvatarImage
                                                src={avatarUrl}
                                                alt={username}
                                            />
                                        )}
                                        <AvatarFallback className="rounded-lg">
                                            {initials || "U"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {username}
                                        </span>
                                        <span className="truncate text-xs text-muted-foreground">
                                            Account settings
                                        </span>
                                    </div>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent
                                    side="top"
                                    align="end"
                                    className="min-w-56"
                                >
                                    <DropdownMenuLabel>
                                        My Account
                                    </DropdownMenuLabel>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuGroup>
                                        <DropdownMenuItem
                                            onClick={() =>
                                                router.push("/settings")
                                            }
                                        >
                                            <Settings className="mr-2 size-4" />
                                            Settings
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>

                                    <DropdownMenuSeparator />

                                    <DropdownMenuItem
                                        disabled={logout.isPending}
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="mr-2 size-4" />
                                        {logout.isPending
                                            ? "Logging out..."
                                            : "Log out"}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>

            <SidebarInset>
                {!hideHeader && (
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />

                        <Separator
                            orientation="vertical"
                            className="mr-2 h-4"
                        />

                        <div className="min-w-0 flex-1">
                            {title && (
                                <h1 className="truncate text-lg font-semibold tracking-tight">
                                    {title}
                                </h1>
                            )}

                            {description && (
                                <p className="truncate text-sm text-muted-foreground">
                                    {description}
                                </p>
                            )}
                        </div>

                        <div className="flex shrink-0 items-center gap-2">
                            {actions}
                            <ModeToggle />
                        </div>
                    </header>
                )}

                <main className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
                    {children}
                </main>
            </SidebarInset>
        </SidebarProvider>
    );
}

export function BrandMark({
    className,
}: {
    className?: string;
}) {
    return (
        <div
            className={cn(
                "flex items-center gap-2.5 font-semibold tracking-tight",
                className
            )}
        >
            <DevPilotIcon className="size-8 rounded-[10px]" />
            <span className="font-heading text-[1.05rem] leading-none">
                DevPilot
            </span>
        </div>
    );
}

export function GhostButtonLink({
    href,
    children,
    className,
}: {
    href: string;
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <Button
            variant="ghost"
            size="sm"
            className={className}
            render={<Link href={href} />}
        >
            {children}
        </Button>
    );
}
