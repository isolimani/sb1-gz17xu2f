import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/Button";

export const metadata = { title: "Settings" };

export default async function BusinessSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: biz } = await supabase
    .from("business_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const { data: userRow } = await supabase
    .from("users")
    .select("name, email, avatar_url")
    .eq("id", user.id)
    .single();

  const BUSINESS_TYPES = [
    { value: "CAFE", label: "Café" },
    { value: "RESTAURANT", label: "Restaurant" },
    { value: "HOTEL", label: "Hotel" },
    { value: "EVENT", label: "Event" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <div className="space-y-8 max-w-2xl">
      <h1 className="text-2xl font-black text-foreground">Settings</h1>

      {/* Business Profile */}
      <section className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Business profile</h2>
          <p className="text-xs text-muted mt-0.5">
            This information is shown to baristas on your job postings.
          </p>
        </div>
        <form action="/api/business/profile" method="POST" className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">
                Business name
              </label>
              <input
                type="text"
                name="business_name"
                defaultValue={biz?.business_name ?? ""}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">ABN</label>
              <input
                type="text"
                name="abn"
                defaultValue={biz?.abn ?? ""}
                placeholder="12 345 678 901"
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">
              Business type
            </label>
            <div className="grid grid-cols-5 gap-2">
              {BUSINESS_TYPES.map((bt) => (
                <label key={bt.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value={bt.value}
                    defaultChecked={biz?.type === bt.value}
                    className="sr-only peer"
                  />
                  <div className="px-2 py-2 rounded-xl border border-border bg-background text-center text-xs font-medium text-muted peer-checked:border-brand peer-checked:text-brand peer-checked:bg-brand/5 transition-all cursor-pointer hover:border-brand/40">
                    {bt.label}
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1">Address</label>
            <input
              type="text"
              name="address"
              defaultValue={biz?.address ?? ""}
              required
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Suburb</label>
              <input
                type="text"
                name="suburb"
                defaultValue={biz?.suburb ?? ""}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">State</label>
              <select
                name="state"
                defaultValue={biz?.state ?? "VIC"}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              >
                {["VIC", "NSW", "QLD", "WA", "SA", "TAS", "ACT", "NT"].map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Postcode</label>
              <input
                type="text"
                name="postcode"
                defaultValue={biz?.postcode ?? ""}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit">Save changes</Button>
          </div>
        </form>
      </section>

      {/* Payment method */}
      <section className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Payment method</h2>
          <p className="text-xs text-muted mt-0.5">
            How you pay for completed shifts. Invoices are due within 48 hours.
          </p>
        </div>
        <div className="p-6 space-y-4">
          {/* Preferred method selector */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                value: "STRIPE",
                label: "Card / Online",
                desc: "Automatic charge via Stripe",
                icon: "💳",
              },
              {
                value: "MANUAL",
                label: "Bank transfer",
                desc: "Pay invoice manually by EFT",
                icon: "🏦",
              },
            ].map((method) => (
              <div
                key={method.value}
                className={`rounded-xl border p-4 cursor-pointer transition-all ${
                  biz?.preferred_payment === method.value
                    ? "border-brand bg-brand/5"
                    : "border-border hover:border-brand/40"
                }`}
              >
                <p className="text-lg mb-1">{method.icon}</p>
                <p className="text-sm font-semibold text-foreground">{method.label}</p>
                <p className="text-xs text-muted">{method.desc}</p>
              </div>
            ))}
          </div>

          {/* Stripe card setup */}
          {biz?.preferred_payment === "STRIPE" ? (
            <div className="bg-background rounded-xl border border-border p-4">
              {biz.stripe_customer_id ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-foreground">Card on file</p>
                    <p className="text-xs text-muted">Manage via Stripe customer portal</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage card →
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted">No card on file yet.</p>
                  <Button size="sm">Add card →</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-background rounded-xl border border-border p-4 space-y-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide">
                Bank transfer details will appear on your invoices
              </p>
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-xs font-medium text-muted mb-1">
                    Account name
                  </label>
                  <input
                    type="text"
                    defaultValue={biz?.bank_account_name ?? ""}
                    placeholder="Company Pty Ltd"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand/50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">BSB</label>
                    <input
                      type="text"
                      defaultValue={biz?.bank_bsb ?? ""}
                      placeholder="000-000"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                      Account number
                    </label>
                    <input
                      type="text"
                      defaultValue={biz?.bank_account_number ?? ""}
                      placeholder="12345678"
                      className="w-full px-3 py-2 rounded-xl border border-border bg-surface text-sm focus:outline-none focus:border-brand/50"
                    />
                  </div>
                </div>
              </div>
              <Button size="sm">Save bank details</Button>
            </div>
          )}
        </div>
      </section>

      {/* Account */}
      <section className="bg-surface rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-semibold text-foreground">Account</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Name</label>
              <input
                type="text"
                defaultValue={userRow?.name ?? ""}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:border-brand/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1">Email</label>
              <input
                type="email"
                value={userRow?.email ?? ""}
                readOnly
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-sm text-muted cursor-not-allowed"
              />
            </div>
          </div>
          <Button variant="outline" size="sm">Change password</Button>
        </div>
      </section>

      {/* Danger zone */}
      <section className="bg-surface rounded-2xl border border-error/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-error/20">
          <h2 className="font-semibold text-error">Danger zone</h2>
        </div>
        <div className="p-6">
          <p className="text-sm text-muted mb-4">
            Permanently delete your business account. This cannot be undone.
          </p>
          <Button variant="danger" size="sm">Delete account</Button>
        </div>
      </section>
    </div>
  );
}
