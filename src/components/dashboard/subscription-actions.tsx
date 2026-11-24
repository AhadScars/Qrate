"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { requestPaymentAction } from "@/lib/actions/owner";
import { Button } from "@/components/ui";

export function SubscriptionActions() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function requestManual() {
    setError("");
    const result = await requestPaymentAction();
    if (!result.ok) setError("Could not send the request.");
    else {
      setMessage("Request sent. The super admin sets the end date on the customer dashboard.");
      router.refresh();
    }
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button type="button" onClick={() => void requestManual()}>
        Request manual activation
      </Button>
      {message ? <p className="w-full text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="w-full text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
