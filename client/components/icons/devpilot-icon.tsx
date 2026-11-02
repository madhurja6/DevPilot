import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

type DevPilotIconProps = SVGProps<SVGSVGElement> & {
    variant?: "color" | "mono";
};

export function DevPilotIcon({
    className,
    variant = "color",
    ...props
}: DevPilotIconProps) {
    const mono = variant === "mono";

    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className={cn("shrink-0", className)}
            {...props}
        >
            <rect
                width="64"
                height="64"
                rx="14"
                fill={mono ? "currentColor" : "url(#paint0_linear)"}
            />
            <path
                d="M20 32L28 40L44 24"
                stroke={mono ? "var(--background, #fff)" : "#fff"}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {!mono && (
                <defs>
                    <linearGradient
                        id="paint0_linear"
                        x1="0"
                        y1="0"
                        x2="64"
                        y2="64"
                        gradientUnits="userSpaceOnUse"
                    >
                        <stop stopColor="#3b82f6" />
                        <stop offset="1" stopColor="#1d4ed8" />
                    </linearGradient>
                </defs>
            )}
        </svg>
    );
}