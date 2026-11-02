import { Code } from "lucide-react";
import type { IconType } from "react-icons";
import {
    SiC,
    SiClojure,
    SiCplusplus,
    SiCrystal,
    SiCss,
    SiDart,
    SiDocker,
    SiElixir,
    SiErlang,
    SiFsharp,
    SiGnubash,
    SiGo,
    SiGraphql,
    SiHaskell,
    SiHtml5,
    SiJavascript,
    SiJson,
    SiJupyter,
    SiKotlin,
    SiLua,
    SiMarkdown,
    SiMysql,
    SiPhp,
    SiPython,
    SiReact,
    SiRuby,
    SiRust,
    SiScala,
    SiSwift,
    SiTypescript,
    SiVuedotjs,
    SiWebassembly,
    SiYaml,
    SiZig,
} from "react-icons/si";

import { cn } from "@/lib/utils";

type LanguageConfig = {
    Icon: IconType;
    bg: string;
    iconClass: string;
};

export const LANGUAGE_MAP: Record<string, LanguageConfig> = {
    JavaScript: {
        Icon: SiJavascript,
        bg: "bg-[#F7DF1E]",
        iconClass: "text-[#323330]",
    },
    TypeScript: {
        Icon: SiTypescript,
        bg: "bg-[#3178C6]",
        iconClass: "text-white",
    },
    Python: {
        Icon: SiPython,
        bg: "bg-[#3776AB]",
        iconClass: "text-white",
    },
    Java: {
        Icon: Code,
        bg: "bg-[#ED8B00]",
        iconClass: "text-white",
    },
    C: {
        Icon: SiC,
        bg: "bg-[#A8B9CC]",
        iconClass: "text-black",
    },
    "C++": {
        Icon: SiCplusplus,
        bg: "bg-[#00599C]",
        iconClass: "text-white",
    },
    Go: {
        Icon: SiGo,
        bg: "bg-[#00ADD8]",
        iconClass: "text-white",
    },
    Rust: {
        Icon: SiRust,
        bg: "bg-[#000000]",
        iconClass: "text-white",
    },
    Ruby: {
        Icon: SiRuby,
        bg: "bg-[#CC342D]",
        iconClass: "text-white",
    },
    PHP: {
        Icon: SiPhp,
        bg: "bg-[#777BB4]",
        iconClass: "text-white",
    },
    Swift: {
        Icon: SiSwift,
        bg: "bg-[#F05138]",
        iconClass: "text-white",
    },
    Kotlin: {
        Icon: SiKotlin,
        bg: "bg-[#7F52FF]",
        iconClass: "text-white",
    },
    HTML: {
        Icon: SiHtml5,
        bg: "bg-[#E34F26]",
        iconClass: "text-white",
    },
    CSS: {
        Icon: SiCss,
        bg: "bg-[#1572B6]",
        iconClass: "text-white",
    },
    Docker: {
        Icon: SiDocker,
        bg: "bg-[#2496ED]",
        iconClass: "text-white",
    },
    GraphQL: {
        Icon: SiGraphql,
        bg: "bg-[#E10098]",
        iconClass: "text-white",
    },
    YAML: {
        Icon: SiYaml,
        bg: "bg-[#CB171E]",
        iconClass: "text-white",
    },
    JSON: {
        Icon: SiJson,
        bg: "bg-[#000000]",
        iconClass: "text-white",
    },
    Markdown: {
        Icon: SiMarkdown,
        bg: "bg-[#000000]",
        iconClass: "text-white",
    },
    Zig: {
        Icon: SiZig,
        bg: "bg-[#F7A41D]",
        iconClass: "text-black",
    },
    WebAssembly: {
        Icon: SiWebassembly,
        bg: "bg-[#654FF0]",
        iconClass: "text-white",
    },
};

interface LanguageIconProps {
    language: string | null;
    className?: string;
    size?: "sm" | "md" | "lg";
}

export function getLanguageLabel(language: string | null) {
    return language || "Unknown";
}

export function LanguageIcon({ language, className, size = "md" }: LanguageIconProps) {
    const config = (language ? LANGUAGE_MAP[language] : undefined) || {
        Icon: Code,
        bg: "bg-muted",
        iconClass: "text-muted-foreground",
    };

    const { Icon, bg, iconClass } = config;
    const sizeClass = size === "sm" ? "size-3" : size === "lg" ? "size-5" : "size-4";

    return (
        <div className={cn("flex items-center justify-center rounded-md p-1.5", bg, className)}>
            <Icon className={cn(sizeClass, iconClass)} />
        </div>
    );
}