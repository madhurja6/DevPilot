import type { IndexStatus } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function IndexStatusLabel(status: IndexStatus) {
    switch (status) {
        case "INDEXED":
            return "Ready";
        case "INDEXING":
            return "Indexing";
        case "FAILED":
            return "Failed";
        default:
            return "Not indexed";
    }
}

export function IndexStatusBadge({
    status,
    className,
}: {
    status: IndexStatus;
    className?: string;
}) {
    const variant =
        status === "INDEXED" ? "default" :
            status === "INDEXING" ? "secondary" :
                status === "FAILED" ? "destructive" : "outline";

    return (
        <Badge
            variant={variant}
            className={cn(
                "capitalize",
                status === "INDEXED" && "bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/25 border-emerald-500/20",
                status === "INDEXING" && "bg-blue-500/15 text-blue-600 hover:bg-blue-500/25 border-blue-500/20",
                className
            )}
        >
            {IndexStatusLabel(status)}
        </Badge>
    );
}