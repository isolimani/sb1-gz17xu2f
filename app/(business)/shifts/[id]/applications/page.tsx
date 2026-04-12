import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Avatar, StarRating } from "@/components/ui/Avatar";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatShiftRange, formatShiftDuration, formatFullDate } from "@/lib/utils/date";
import { formatAUD, computeShiftCost } from "@/lib/utils/currency";
import type { Shift, Application, WorkerProfile } from "@/lib/types";
import ApplicationActions from "./ApplicationActions";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return { title: "Applications" };
}

export default async function ApplicationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  const { data: shift } = await supabase
    .from("shifts")
    .select("*")
    .eq("id", id)
    .eq("business_id", user.id)
    .single();

  if (!shift) notFound();

  const { data: applications } = await supabase
    .from("applications")
    .select(`
      *,
      worker:worker_profiles(
        *,
        user:users(name, avatar_url, email)
      )
    `)
    .eq("shift_id", id)
    .order("created_at", { ascending: true });

  const typedShift = shift as unknown as Shift;
  const typedApps = (applications ?? []) as unknown as (Application & {
    worker: WorkerProfile & { user: { name: string; avatar_url?: string; email: string } };
  })[];

  const totalHours = (new Date(shift.end_time).getTime() - new Date(shift.start_time).getTime()) / 3600000;
  const cost = computeShiftCost(shift.hourly_rate, totalHours);

  return (
    <div className="max-w-3xl space-y-6">
      {/* Shift summary */}
      <div>
        <Link
          href="/business/shifts"
          className="text-xs text-muted hover:text-foreground mb-3 inline-flex items-center gap-1"
        >
          ← All shifts
        </Link>
        <div className="bg-surface rounded-2xl border border-border p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-xl font-black text-foreground">
                  {typedShift.title}
                </h1>
                <StatusBadge status={typedShift.status} />
              </div>
              <p className="text-sm text-muted">
                {formatFullDate(typedShift.start_time)}
              </p>
              <p className="text-sm text-muted">
                {formatShiftRange(typedShift.start_time, typedShift.end_time)} ·{" "}
                {formatShiftDuration(typedShift.start_time, typedShift.end_time)} ·{" "}
                {typedShift.suburb}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-2xl font-black text-foreground">
                {formatAUD(cost.businessTotal)}
              </p>
              <p className="text-xs text-muted">
                ${typedShift.hourly_rate}/hr · worker gets{" "}
                {formatAUD(cost.gross)}
              </p>
            </div>
          </div>

          {typedShift.equipment && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted">
                <strong>Equipment:</strong> {typedShift.equipment}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Applications */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">
          {typedApps.length === 0
            ? "No applications yet"
            : `${typedApps.length} applicant${typedApps.length !== 1 ? "s" : ""}`}
        </h2>

        {typedApps.length === 0 && (
          <div className="bg-surface rounded-2xl border border-border p-10 text-center">
            <p className="text-4xl mb-3">⏳</p>
            <p className="text-muted text-sm">
              Your shift is live — baristas are browsing now.
            </p>
          </div>
        )}

        <div className="space-y-3">
          {typedApps.map((app) => {
            const workerUser = app.worker?.user;
            const workerProfile = app.worker;

            return (
              <div
                key={app.id}
                className="bg-surface rounded-2xl border border-border p-5"
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    src={workerUser?.avatar_url}
                    name={workerUser?.name}
                    size="lg"
                  />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">
                          {workerUser?.name}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <StarRating
                            rating={workerProfile?.avg_rating}
                            count={workerProfile?.total_shifts_completed}
                          />
                          {workerProfile?.years_experience > 0 && (
                            <span className="text-xs text-muted">
                              {workerProfile.years_experience} yr
                              {workerProfile.years_experience !== 1 ? "s" : ""}{" "}
                              exp
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    {/* Stats row */}
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-muted">
                        <strong className="text-foreground">
                          {workerProfile?.total_shifts_completed ?? 0}
                        </strong>{" "}
                        jobs
                      </span>
                      <span className="text-xs text-muted">
                        <strong className="text-foreground">
                          {workerProfile?.completion_rate ?? 100}%
                        </strong>{" "}
                        completion
                      </span>
                      <span className="text-xs text-muted">
                        <strong className="text-brand">
                          {workerProfile?.karma ?? 0}
                        </strong>{" "}
                        karma
                      </span>
                    </div>

                    {/* Skills */}
                    {workerProfile?.skills && workerProfile.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {workerProfile.skills.map((skill) => {
                          const matches = typedShift.required_skills.includes(skill);
                          return (
                            <Badge
                              key={skill}
                              variant={matches ? "brand" : "muted"}
                              className="text-[10px]"
                            >
                              {matches && "✓ "}
                              {skill}
                            </Badge>
                          );
                        })}
                      </div>
                    )}

                    {/* Cover message */}
                    {app.message && (
                      <div className="mt-3 bg-background rounded-xl px-3 py-2">
                        <p className="text-xs text-muted italic">
                          &ldquo;{app.message}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Actions */}
                    {app.status === "PENDING" && typedShift.status === "OPEN" && (
                      <div className="flex gap-2 mt-3">
                        <ApplicationActions
                          applicationId={app.id}
                          shiftId={id}
                          action="OFFERED"
                        >
                          <Button size="sm">Offer the job</Button>
                        </ApplicationActions>
                        <ApplicationActions
                          applicationId={app.id}
                          shiftId={id}
                          action="REJECTED"
                        >
                          <Button variant="outline" size="sm">
                            Decline
                          </Button>
                        </ApplicationActions>
                      </div>
                    )}

                    {app.status === "OFFERED" && (
                      <p className="text-xs text-warning mt-2">
                        ⏳ Waiting for barista to accept or decline…
                      </p>
                    )}

                    {app.status === "ACCEPTED" && (
                      <p className="text-xs text-success mt-2 font-semibold">
                        ✓ Shift filled! {workerUser?.name} will be there.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
