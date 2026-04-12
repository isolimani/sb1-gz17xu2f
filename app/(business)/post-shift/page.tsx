"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { cn } from "@/lib/utils/cn";
import { computeShiftCost, formatAUD } from "@/lib/utils/currency";
import { BARISTA_SKILLS, AU_STATES, type JobType } from "@/lib/types";

export default function PostShiftPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [jobType, setJobType] = useState<JobType>("TEMP");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [equipment, setEquipment] = useState("");
  const [address, setAddress] = useState("");
  const [suburb, setSuburb] = useState("");
  const [state, setState] = useState("VIC");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("07:00");
  const [endTime, setEndTime] = useState("14:00");
  const [hourlyRate, setHourlyRate] = useState("40");
  const [minExp, setMinExp] = useState("1");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [dressCode, setDressCode] = useState("All black, apron provided");
  const [notes, setNotes] = useState("");

  function toggleSkill(skill: string) {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  }

  // Fee preview
  const startDt = startDate && startTime ? new Date(`${startDate}T${startTime}`) : null;
  const endDt = startDate && endTime ? new Date(`${startDate}T${endTime}`) : null;
  const totalHours =
    startDt && endDt
      ? Math.max(0, (endDt.getTime() - startDt.getTime()) / 3600000)
      : 0;
  const cost = computeShiftCost(parseFloat(hourlyRate) || 0, totalHours);

  async function handlePublish(asDraft = false) {
    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const startIso = `${startDate}T${startTime}:00`;
    const endIso = `${startDate}T${endTime}:00`;

    const { data, error } = await supabase
      .from("shifts")
      .insert({
        business_id: user.id,
        job_type: jobType,
        title,
        description,
        equipment,
        address,
        suburb,
        state,
        start_time: startIso,
        end_time: endIso,
        hourly_rate: parseFloat(hourlyRate),
        required_skills: selectedSkills,
        min_experience_years: parseInt(minExp),
        dress_code: dressCode,
        notes,
        status: asDraft ? "DRAFT" : "OPEN",
      })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/business/shifts/${data.id}/applications`);
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-foreground">Post a shift</h1>
        <p className="text-sm text-muted">
          Your listing goes live instantly once published
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-5">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Job type */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Job type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: "TEMP", label: "Casual / Temp", desc: "One or more shifts", icon: "⚡" },
                { value: "PERM", label: "Permanent / Part-time", desc: "Ongoing role", icon: "📌" },
              ] as const
            ).map((jt) => (
              <button
                key={jt.value}
                type="button"
                onClick={() => setJobType(jt.value)}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-xl border text-left transition-all",
                  jobType === jt.value
                    ? "border-brand bg-brand-light"
                    : "border-border hover:border-brand/40"
                )}
              >
                <span className="text-xl mt-0.5">{jt.icon}</span>
                <div>
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      jobType === jt.value ? "text-brand" : "text-foreground"
                    )}
                  >
                    {jt.label}
                  </p>
                  <p className="text-xs text-muted">{jt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <Input
          label="Shift title"
          placeholder="e.g. Saturday morning barista"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Textarea
          label="Description"
          placeholder="Tell baristas what to expect — the vibe, the volume, what they'll be doing."
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <Textarea
          label="Equipment (optional)"
          placeholder="e.g. La Marzocco Linea PB, Fiorenzato F83, Industry Beans"
          rows={2}
          value={equipment}
          onChange={(e) => setEquipment(e.target.value)}
          hint="Baristas love knowing what machine they'll be working on."
        />

        <Input
          label="Address"
          placeholder="82 Smith Street, Fitzroy VIC"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Suburb"
            placeholder="Fitzroy"
            value={suburb}
            onChange={(e) => setSuburb(e.target.value)}
            required
          />
          <div>
            <label className="text-sm font-medium text-foreground block mb-1.5">
              State
            </label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
            >
              {AU_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Date & Time */}
        <div>
          <p className="text-sm font-medium text-foreground mb-2">Date & time</p>
          <div className="grid grid-cols-3 gap-3">
            <Input
              type="date"
              label="Date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <Input
              type="time"
              label="Start"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
            <Input
              type="time"
              label="End"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Rate + fee preview */}
        <div>
          <Input
            label="Hourly rate (AUD)"
            type="number"
            min="25"
            max="200"
            step="0.5"
            value={hourlyRate}
            onChange={(e) => setHourlyRate(e.target.value)}
            leftIcon={<span className="text-sm font-semibold">$</span>}
          />
          {totalHours > 0 && cost.gross > 0 && (
            <div className="mt-3 bg-brand-50 border border-brand/20 rounded-xl p-4 text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-muted">
                  Worker earns ({totalHours.toFixed(1)} hrs × $
                  {hourlyRate}/hr)
                </span>
                <span className="font-semibold text-success">
                  {formatAUD(cost.gross)}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-muted">Cuppa fee (7%)</span>
                <span className="font-medium text-brand">
                  + {formatAUD(cost.platformFee)}
                </span>
              </div>
              <div className="flex justify-between border-t border-brand/20 pt-2 font-semibold">
                <span className="text-foreground">You pay total</span>
                <span className="text-foreground">
                  {formatAUD(cost.businessTotal)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Required skills */}
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Required skills
          </label>
          <div className="flex flex-wrap gap-2">
            {BARISTA_SKILLS.map((skill) => (
              <button
                key={skill}
                type="button"
                onClick={() => toggleSkill(skill)}
                className={cn(
                  "px-3 py-1.5 rounded-full border text-xs font-medium transition-all",
                  selectedSkills.includes(skill)
                    ? "bg-brand border-brand text-white"
                    : "border-border text-muted hover:border-brand/40"
                )}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground block mb-1.5">
            Minimum experience
          </label>
          <select
            value={minExp}
            onChange={(e) => setMinExp(e.target.value)}
            className="w-full h-10 rounded-xl border border-border bg-surface px-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            {["0", "1", "2", "3", "5"].map((v) => (
              <option key={v} value={v}>
                {v === "0"
                  ? "No minimum"
                  : `${v}+ year${v === "1" ? "" : "s"}`}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Dress code (optional)"
          placeholder="e.g. All black, apron provided"
          value={dressCode}
          onChange={(e) => setDressCode(e.target.value)}
        />

        <Textarea
          label="Additional notes (optional)"
          placeholder="e.g. Staff meal provided, street parking available, friendly team"
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => handlePublish(true)}
            disabled={loading}
          >
            Save as draft
          </Button>
          <Button
            fullWidth
            size="lg"
            loading={loading}
            onClick={() => handlePublish(false)}
            disabled={!title || !startDate || !suburb}
          >
            Publish shift →
          </Button>
        </div>
      </div>
    </div>
  );
}
