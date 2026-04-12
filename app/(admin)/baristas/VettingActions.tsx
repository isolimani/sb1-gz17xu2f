"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function VettingActions({
  workerId,
  action,
}: {
  workerId: string;
  action: "APPROVED" | "REJECTED";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleVet() {
    setLoading(true);
    await fetch(`/api/admin/baristas/${workerId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vetting_status: action }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <Button
      size="sm"
      variant={action === "APPROVED" ? "primary" : "outline"}
      loading={loading}
      onClick={handleVet}
    >
      {action === "APPROVED" ? "✓ Approve" : "✗ Reject"}
    </Button>
  );
}
