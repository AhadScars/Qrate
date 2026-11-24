import { cn } from "@/lib/utils";

export function Button({
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" | "soft" }) {
  const styles = {
    primary: "bg-indigo-700 text-white hover:bg-indigo-800",
    ghost: "bg-white text-stone-800 ring-1 ring-stone-200 hover:bg-stone-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
    soft: "bg-indigo-50 text-indigo-800 hover:bg-indigo-100",
  }[variant];
  return (
    <button
      className={cn(
        "inline-flex h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        styles,
        className,
      )}
      {...props}
    />
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium text-stone-700">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-stone-500">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  "h-11 w-full rounded-2xl border border-stone-200 bg-white px-3 text-sm outline-none ring-indigo-200 focus:ring-4";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={controlClass} {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClass, "h-auto py-3")} {...props} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={controlClass} {...props} />;
}

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <section className={cn("rounded-3xl bg-white p-5 shadow-sm ring-1 ring-stone-200/80", className)}>{children}</section>;
}

export function Badge({ children, tone = "slate" }: { children: React.ReactNode; tone?: "slate" | "green" | "amber" | "red" | "indigo" }) {
  const tones = {
    slate: "bg-stone-100 text-stone-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
    indigo: "bg-indigo-50 text-indigo-700",
  }[tone];
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones)}>{children}</span>;
}

export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-3xl border border-dashed border-stone-300 bg-white/70 px-6 py-12 text-center">
      <h3 className="font-display text-2xl">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-600">{body}</p>
    </div>
  );
}

export function PageHeader({ title, body, action }: { title: string; body?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-display text-3xl tracking-tight text-stone-950">{title}</h1>
        {body ? <p className="mt-1 max-w-2xl text-sm text-stone-600">{body}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <Card>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-display text-3xl text-stone-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-stone-500">{hint}</p> : null}
    </Card>
  );
}

export function statusTone(status: string): "green" | "amber" | "red" | "slate" | "indigo" {
  if (status === "ACTIVE" || status === "PAID" || status === "TRIAL") return status === "TRIAL" ? "indigo" : "green";
  if (status === "PENDING" || status === "SUSPENDED") return "amber";
  if (status === "EXPIRED" || status === "CANCELLED" || status === "DEACTIVATED" || status === "FAILED") return "red";
  return "slate";
}
