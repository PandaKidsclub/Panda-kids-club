import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export function IconButton({ label, children, className = "", type = "button", ...props }: IconButtonProps) {
  return (
    <button className={`icon-button ${className}`.trim()} type={type} aria-label={label} {...props}>
      {children}
    </button>
  );
}

