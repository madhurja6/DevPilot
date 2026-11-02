import type { ReactNode } from "react";

import { SidebarProvider } from "@/components/providers/sidebar-provider";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return <SidebarProvider>{children}</SidebarProvider>;
}
