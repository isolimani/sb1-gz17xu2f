import { cn } from "@/lib/utils/cn";
import { formatDateCard, formatShiftRange, formatShiftDuration } from "@/lib/utils/date";
import { formatAUD } from "@/lib/utils/currency";
import { Badge } from "@/components/ui/Badge";
import type { Shift } from "@/lib/types";
import Link from "next/link";
import Image from "next/image";

interface ShiftCardProps {
  shift: Shift;
  href: string;
  showDistance?: boolean;
}

export function ShiftCard({ shift, href, showDistance = true }: ShiftCardProps) {
  const dateCard = formatDateCard(shift.start_time);
  const timeRange = formatShiftRange(shift.start_time, shift.end_time);
  const duration = formatShiftDuration(shift.start_time, shift.end_time);

  // Estimate total pay
  const hours = parseFloat(duration.replace(" hrs", "").replace(" hr", ""));
  const estimatedPay = shift.hourly_rate * (isNaN(hours) ? 0 : hours);

  return (
    <Link href={href}>
      <div className="bg-surface rounded-2xl border border-border hover:border-brand/40 hover:shadow-md transition-all duration-200 p-4 flex gap-3">
        {/* Date / Logo column */}
        <div className="shrink-0 flex flex-col items-center">
          {shift.business?.logo_url ? (
            <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border">
              <Image
                src={shift.business.logo_url}
                alt={shift.business.business_name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
          ) : (
            <div className="h-12 w-12 rounded-xl border border-border bg-background flex flex-col items-center justify-center text-center leading-none p-1">
              <span className="text-[9px] font-bold text-muted">{dateCard.day}</span>
              <span className="text-lg font-black text-foreground leading-none">{dateCard.date}</span>
              <span className="text-[9px] font-bold text-muted">{dateCard.month}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-foreground text-sm truncate">
                {shift.business?.business_name ?? "Business"}
              </p>
              <p className="text-xs text-muted mt-0.5">
                {timeRange} · {duration}
              </p>
              <p className="text-xs text-muted">
                {shift.title}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-bold text-foreground text-base">
                {estimatedPay > 0 ? formatAUD(estimatedPay) : `$${shift.hourly_rate}/hr`}
              </p>
              {estimatedPay > 0 && (
                <p className="text-xs text-muted">{duration}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            {/* Skills */}
            <div className="flex flex-wrap gap-1">
              {shift.required_skills.slice(0, 2).map((skill) => (
                <Badge key={skill} variant="muted" className="text-[10px] px-2 py-0">
                  {skill}
                </Badge>
              ))}
              {shift.required_skills.length > 2 && (
                <Badge variant="muted" className="text-[10px] px-2 py-0">
                  +{shift.required_skills.length - 2}
                </Badge>
              )}
            </div>

            {/* Distance */}
            {showDistance && (
              <p className={cn("text-xs font-medium shrink-0",
                shift.distance_km != null ? "text-brand" : "text-muted"
              )}>
                {shift.distance_km != null
                  ? `${shift.distance_km.toFixed(0)} km away`
                  : shift.suburb}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

/** Compact card for business dashboard list */
export function ShiftListRow({
  shift,
  href,
}: {
  shift: Shift;
  href: string;
}) {
  const dateCard = formatDateCard(shift.start_time);
  const timeRange = formatShiftRange(shift.start_time, shift.end_time);

  return (
    <Link href={href}>
      <div className="flex items-center gap-3 py-3 border-b border-border last:border-0 hover:bg-background/50 -mx-5 px-5 transition-colors">
        {/* Date chip */}
        <div className="w-11 text-center shrink-0">
          <p className="text-[9px] font-bold text-muted uppercase">{dateCard.day}</p>
          <p className="text-lg font-black text-foreground leading-none">{dateCard.date}</p>
          <p className="text-[9px] font-bold text-muted uppercase">{dateCard.month}</p>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{shift.title}</p>
          <p className="text-xs text-muted">{timeRange} · {shift.suburb}</p>
        </div>

        <div className="text-right shrink-0">
          <p className="text-sm font-bold text-foreground">${shift.hourly_rate}/hr</p>
          <p className="text-xs text-muted">
            {shift.application_count ?? 0} applicant{shift.application_count !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}
