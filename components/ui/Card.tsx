import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  hover = false,
  padding = "md",
  className,
  children,
  ...props
}: CardProps) {
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      className={cn(
        "bg-surface rounded-2xl border border-border",
        hover &&
          "hover:border-brand/40 hover:shadow-md transition-all duration-200 cursor-pointer",
        paddings[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between mb-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-base font-semibold text-foreground", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function StatCard({
  label,
  value,
  sub,
  icon,
  highlight = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon?: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <Card
      className={cn(highlight && "border-brand/30 bg-brand-50")}
      padding="md"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted uppercase tracking-wide">
            {label}
          </p>
          <p
            className={cn(
              "text-2xl font-bold mt-1",
              highlight ? "text-brand" : "text-foreground"
            )}
          >
            {value}
          </p>
          {sub && <p className="text-xs text-muted mt-0.5">{sub}</p>}
        </div>
        {icon && (
          <div
            className={cn(
              "p-2 rounded-xl",
              highlight ? "bg-brand/10 text-brand" : "bg-background text-muted"
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}
