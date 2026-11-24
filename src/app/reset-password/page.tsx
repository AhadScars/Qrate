import Link from "next/link";
import { ResetForm } from "@/components/auth/auth-forms";

export const instant = false;

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="font-display text-4xl">Choose a new password</h1>
      <div className="mt-6 rounded-[2rem] bg-white p-6 ring-1 ring-stone-200">
        {params.token ? <ResetForm token={params.token} /> : <p>This reset link is missing a token.</p>}
      </div>
      <Link href="/login" className="mt-4 text-sm font-semibold text-indigo-700">
        Back to login
      </Link>
    </main>
  );
}
