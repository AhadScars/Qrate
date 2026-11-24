"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { forgotAction, loginAction, registerAction, resetAction } from "@/lib/actions/auth";
import { Button, Field, TextInput } from "@/components/ui";

export function LoginForm() {
  const form = useForm({ defaultValues: { email: "", password: "" } });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await loginAction(values);
        if (result && !result.ok) setError(result.error);
      })}
    >
      <Field label="Email">
        <TextInput type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Password">
        <TextInput type="password" autoComplete="current-password" {...form.register("password")} />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Signing in…" : "Log in"}
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const form = useForm({ defaultValues: { name: "", email: "", password: "", businessName: "", phone: "" } });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await registerAction(values);
        if (result && !result.ok) setError(result.error);
      })}
    >
      <Field label="Your name">
        <TextInput autoComplete="name" {...form.register("name")} />
      </Field>
      <Field label="Business name">
        <TextInput {...form.register("businessName")} />
      </Field>
      <Field label="Work email">
        <TextInput type="email" autoComplete="email" {...form.register("email")} />
      </Field>
      <Field label="Phone" hint="Optional">
        <TextInput {...form.register("phone")} />
      </Field>
      <Field label="Password" hint="At least 8 characters">
        <TextInput type="password" autoComplete="new-password" {...form.register("password")} />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? "Creating account…" : "Create account"}
      </Button>
    </form>
  );
}

export function ForgotForm() {
  const form = useForm({ defaultValues: { email: "" } });
  const [error, setError] = useState("");
  const [link, setLink] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await forgotAction(values);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setDone(true);
        setLink(result.devLink);
      })}
    >
      <Field label="Email">
        <TextInput type="email" {...form.register("email")} />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {done ? (
        <div className="rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800">
          If that account exists, the reset is ready.
          {link ? (
            <a className="mt-2 block font-semibold underline" href={link}>
              Email is not configured, so use this one-hour link.
            </a>
          ) : (
            <p className="mt-2">Check the inbox for the reset email.</p>
          )}
        </div>
      ) : null}
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const form = useForm({ defaultValues: { password: "" } });
  const [error, setError] = useState("");
  return (
    <form
      className="space-y-4"
      onSubmit={form.handleSubmit(async (values) => {
        setError("");
        const result = await resetAction({ token, password: values.password });
        if (result && !result.ok) setError(result.error);
      })}
    >
      <Field label="New password">
        <TextInput type="password" autoComplete="new-password" {...form.register("password")} />
      </Field>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button className="w-full" type="submit">
        Save password
      </Button>
    </form>
  );
}
