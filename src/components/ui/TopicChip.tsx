import React from "react";

export interface TopicChipProps {
  label: string;
  isSelected?: boolean;
  onClick?: () => void;
  count?: number;
  className?: string;
  asLink?: boolean;
  href?: string;
}

export function TopicChip({
  label,
  isSelected = false,
  onClick,
  count,
  className = "",
}: TopicChipProps) {
  const baseClasses =
    "topic-chip inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-base font-medium transition-colors duration-150 cursor-pointer select-none min-h-[44px]";

  const stateClasses = isSelected
    ? "bg-[var(--sage-600)] text-[var(--bg)] font-semibold"
    : "bg-[var(--sage-100)] text-[var(--sage-700)] hover:bg-[var(--surface-2)] active:bg-[var(--sage-100)]";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={`${baseClasses} ${stateClasses} ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[11px] px-1.5 py-0.2 rounded-full ${
            isSelected
              ? "bg-[var(--sage-700)] text-[var(--bg)]"
              : "bg-[var(--surface-2)] text-[var(--ink-muted)]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

export function TopicChipBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative w-full ${className}`}>
      {/* Scrollable container with edge fades */}
      <div className="topic-chip-bar flex items-center gap-2.5 py-2 px-1">
        {children}
      </div>
    </div>
  );
}
