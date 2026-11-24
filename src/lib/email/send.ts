export async function sendPasswordReset(email: string, resetUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) return { delivered: false as const };

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Reset your Qrate password",
      text: `Use this link within one hour to choose a new password: ${resetUrl}`,
    }),
  });

  if (!response.ok) return { delivered: false as const };
  return { delivered: true as const };
}
