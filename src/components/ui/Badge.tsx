import type { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  tone?: "accent" | "neutral";
}

export function Badge({ children, className = "", tone = "neutral", ...props }: BadgeProps) {
  return (
    <span className={`badge badge--${tone} ${className}`.trim()} {...props}>
      {children}
    </span>
  );
}

