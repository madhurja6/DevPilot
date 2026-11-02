"use client";

import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { useTheme } from "next-themes";

import { GitHubIcon } from "@/components/icons/github-icon";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useCurrentUser, useLogout } from "@/hooks/use-auth";

export function SettingsDashboard() {
    const { data: user } = useCurrentUser();
    const logout = useLogout();
    const { theme, setTheme } = useTheme();

    const isDark = theme === "dark";

    return (
        <div className="max-w-4xl space-y-8 p-6 lg:p-10">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences.
                </p>
            </div>

            <Separator />

            {/* Profile Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Your personal information and connected accounts.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="size-16">
                            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.displayName || ""} />}
                            <AvatarFallback>
                                <UserRound className="size-6 text-muted-foreground" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                            <p className="text-sm font-medium leading-none">
                                {user?.displayName || "User"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                @{user?.githubUsername || "username"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <GitHubIcon className="size-5" />
                            <div className="space-y-0.5">
                                <p className="text-sm font-medium">GitHub Account</p>
                                <p className="text-xs text-muted-foreground">
                                    Connected as @{user?.githubUsername || "username"}
                                </p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                            Connected
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Appearance Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>
                        Customize the look and feel of the dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            {isDark ? <Moon className="size-5" /> : <Sun className="size-5" />}
                            <div className="space-y-0.5">
                                <Label htmlFor="dark-mode" className="text-sm font-medium">
                                    Dark Mode
                                </Label>
                                <p className="text-xs text-muted-foreground">
                                    Toggle between light and dark themes.
                                </p>
                            </div>
                        </div>
                        <Switch
                            id="dark-mode"
                            checked={isDark}
                            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>
                        Actions here can affect your session and data.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                        <div className="space-y-0.5">
                            <p className="text-sm font-medium">Sign out</p>
                            <p className="text-xs text-muted-foreground">
                                Sign out of your DevPilot account on this device.
                            </p>
                        </div>
                        <Button
                            variant="destructive"
                            onClick={() => logout.mutate()}
                            disabled={logout.isPending}
                            className="shrink-0"
                        >
                            <LogOut className="mr-2 size-4" />
                            {logout.isPending ? "Signing out..." : "Sign Out"}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}