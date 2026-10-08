import React, { forwardRef } from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "subtle" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      className = "",
      type = "button",
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-editorial-sans font-medium rounded transition-colors duration-150 cursor-pointer min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sage-700)] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none";

    const sizeStyles = {
      sm: "px-3.5 py-1.5 text-base",
      md: "px-5 py-2.5 text-base",
      lg: "px-7 py-3.5 text-base",
    }[size];

    const variantStyles = {
      primary:
        "bg-[var(--sage-600)] text-[var(--bg)] hover:bg-[var(--sage-700)] active:bg-[var(--sage-700)] shadow-sm",
      secondary:
        "bg-transparent border border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--surface-2)] active:bg-[var(--surface-2)]",
      subtle:
        "bg-transparent text-[var(--ink-muted)] hover:bg-[var(--surface)] hover:text-[var(--ink)]",
      danger:
        "bg-[var(--error)] text-[var(--inverse-ink)] hover:opacity-90 active:opacity-90",
    }[variant];

    return (
      <button
        ref={ref}
        type={type}
        aria-busy={isLoading}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${sizeStyles} ${variantStyles} ${className}`}
        {...props}
      >
        {isLoading ? (
          <span className="inline-flex items-center gap-2">
            <svg
              aria-hidden="true"
              className="animate-spin h-4 w-4 text-current"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  },
);

Button.displayName = "Button";
