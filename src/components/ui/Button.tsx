import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
}

export function Button({ children, className = "", type = "button", ...props }: ButtonProps) {
  return (
    <button className={`button ${className}`.trim()} type={type} {...props}>
      {children}
    </button>
  );
}

