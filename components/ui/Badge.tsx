import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "brand"
    | "success"
    | "warning"
    | "error"
    | "muted"
    | "outline";
}

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: "bg-gray-100 text-gray-700",
    brand: "bg-brand-light text-brand font-semibold",
    success: "bg-green-50 text-green-700",
    warning: "bg-amber-50 text-amber-700",
    error: "bg-red-50 text-red-700",
    muted: "bg-background text-muted",
    outline: "border border-border text-foreground bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export function StatusBadge({
  status,
}: {
  status: string;
}) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> =
    {
      OPEN: { label: "Open", variant: "success" },
      FILLED: { label: "Filled", variant: "brand" },
      IN_PROGRESS: { label: "In Progress", variant: "warning" },
      COMPLETED: { label: "Completed", variant: "muted" },
      CANCELLED: { label: "Cancelled", variant: "error" },
      DRAFT: { label: "Draft", variant: "muted" },
      PENDING: { label: "Pending", variant: "muted" },
      OFFERED: { label: "Offered", variant: "warning" },
      ACCEPTED: { label: "Accepted", variant: "success" },
      REJECTED: { label: "Rejected", variant: "error" },
      DECLINED: { label: "Declined", variant: "error" },
      WITHDRAWN: { label: "Withdrawn", variant: "muted" },
      PAID: { label: "Paid", variant: "success" },
      OVERDUE: { label: "Overdue", variant: "error" },
      APPROVED: { label: "Approved", variant: "success" },
    };

  const config = map[status] ?? { label: status, variant: "muted" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
