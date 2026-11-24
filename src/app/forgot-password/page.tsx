import Link from "next/link";
import { ForgotForm } from "@/components/auth/auth-forms";

export const instant = false;

export default function ForgotPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <Link href="/login" className="text-sm font-semibold text-indigo-700">
        Back to login
      </Link>
      <h1 className="mt-4 font-display text-4xl">Reset password</h1>
      <div className="mt-6 rounded-[2rem] bg-white p-6 ring-1 ring-stone-200">
        <ForgotForm />
      </div>
    </main>
  );
}
