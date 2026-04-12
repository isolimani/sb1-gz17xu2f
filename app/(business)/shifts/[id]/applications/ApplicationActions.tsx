"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface Props {
  applicationId: string;
  shiftId: string;
  action: "OFFERED" | "REJECTED";
  children: React.ReactNode;
}

export default function ApplicationActions({
  applicationId,
  shiftId,
  action,
  children,
}: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAction() {
    setLoading(true);
    await fetch(`/api/applications/${applicationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: action, shiftId }),
    });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleAction}
      disabled={loading}
      className="contents"
    >
      {children}
    </button>
  );
}
