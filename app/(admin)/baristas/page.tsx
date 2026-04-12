import { createClient } from "@/lib/supabase/server";
import { Avatar, StarRating } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import VettingActions from "./VettingActions";

export const metadata = { title: "Barista vetting queue" };

export default async function AdminBaristasPage() {
  const supabase = await createClient();

  const { data: pending } = await supabase
    .from("worker_profiles")
    .select(`
      *,
      user:users(name, avatar_url, email)
    `)
    .eq("vetting_status", "PENDING")
    .order("created_at", { ascending: true });

  const { data: approved } = await supabase
    .from("worker_profiles")
    .select(`
      *,
      user:users(name, avatar_url, email)
    `)
    .eq("vetting_status", "APPROVED")
    .order("created_at", { ascending: false })
    .limit(20);

  function WorkerRow({
    profile,
    showActions,
  }: {
    profile: {
      user_id: string;
      vetting_status: string;
      years_experience: number;
      hourly_rate_min: number;
      skills: string[];
      avg_rating?: number;
      total_shifts_completed: number;
      completion_rate: number;
      karma: number;
      suburb?: string;
      state?: string;
      bio?: string;
      user?: { name: string; avatar_url?: string; email: string };
    };
    showActions: boolean;
  }) {
    return (
      <div className="flex items-start gap-4 py-4 border-b border-border last:border-0">
        <Avatar
          src={profile.user?.avatar_url}
          name={profile.user?.name}
          size="md"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-foreground text-sm">
                {profile.user?.name}
              </p>
              <p className="text-xs text-muted">{profile.user?.email}</p>
              <p className="text-xs text-muted mt-0.5">
                {profile.suburb}, {profile.state} · {profile.years_experience}{" "}
                yr{profile.years_experience !== 1 ? "s" : ""} exp · $
                {profile.hourly_rate_min}/hr
              </p>
            </div>
            <div className="flex items-center gap-2">
              <StarRating rating={profile.avg_rating} />
              <Badge
                variant={
                  profile.vetting_status === "APPROVED"
                    ? "success"
                    : profile.vetting_status === "REJECTED"
                    ? "error"
                    : "warning"
                }
              >
                {profile.vetting_status}
              </Badge>
            </div>
          </div>

          {profile.bio && (
            <p className="text-xs text-muted mt-1 italic line-clamp-2">
              &ldquo;{profile.bio}&rdquo;
            </p>
          )}

          <div className="flex flex-wrap gap-1 mt-2">
            {profile.skills.slice(0, 5).map((skill) => (
              <Badge key={skill} variant="muted" className="text-[10px]">
                {skill}
              </Badge>
            ))}
          </div>

          {showActions && (
            <div className="flex gap-2 mt-3">
              <VettingActions workerId={profile.user_id} action="APPROVED" />
              <VettingActions workerId={profile.user_id} action="REJECTED" />
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <h1 className="text-2xl font-black text-foreground">Vetting queue</h1>

      {/* Pending */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-1">
          Pending review ({pending?.length ?? 0})
        </h2>
        <p className="text-xs text-muted mb-4">
          Review each barista profile and approve or reject.
        </p>

        {(!pending || pending.length === 0) && (
          <p className="text-muted text-sm py-4 text-center">
            All caught up! No pending profiles.
          </p>
        )}

        {pending?.map((p) => (
          <WorkerRow
            key={p.user_id}
            profile={p as Parameters<typeof WorkerRow>[0]["profile"]}
            showActions
          />
        ))}
      </div>

      {/* Recently approved */}
      <div className="bg-surface rounded-2xl border border-border p-5">
        <h2 className="font-semibold text-foreground mb-4">
          Recently approved
        </h2>
        {approved?.map((p) => (
          <WorkerRow
            key={p.user_id}
            profile={p as Parameters<typeof WorkerRow>[0]["profile"]}
            showActions={false}
          />
        ))}
      </div>
    </div>
  );
}
