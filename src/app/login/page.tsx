import Link from "next/link";
import { LoginForm } from "@/components/auth/auth-forms";
import { DigiHubMark } from "@/components/brand";

export const instant = false;

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ reset?: string }> }) {
  const params = await searchParams;
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/" className="font-display text-3xl">
        Qrate
      </Link>
      <h1 className="mt-6 font-display text-4xl">Super admin</h1>
      {params.reset ? <p className="mt-3 text-sm text-emerald-700">Password updated. Log in with the new one.</p> : null}
      <div className="mt-6 rounded-[2rem] bg-white p-6 ring-1 ring-stone-200">
        <LoginForm />
      </div>
      <p className="mt-4 text-sm text-stone-600">
        <Link href="/forgot-password" className="font-semibold text-indigo-700">
          Forgot password
        </Link>

      </p>
      <DigiHubMark className="mt-8 text-center text-sm text-stone-500" />
    </main>
  );
}
