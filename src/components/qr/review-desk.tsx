"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, RefreshCw, Sparkles, Star } from "lucide-react";
import { DigiHubMark } from "@/components/brand";
import { generateDraftAction, recordScanAction, trackReviewAction } from "@/lib/actions/public-review";
import { type ReviewLanguage, type ReviewLength, type ReviewTone } from "@/services/reviews/patterns";

export function ReviewDesk({
  publicId,
  placeName,
  categoryName,
  address,
  welcome,
  logoUrl,
  googleReviewUrl,
}: {
  publicId: string;
  placeName: string;
  categoryName: string;
  address: string;
  welcome: string;
  logoUrl: string | null;
  googleReviewUrl: string | null;
}) {
  const [rating, setRating] = useState(0);
  const [language, setLanguage] = useState<ReviewLanguage>("en");
  const [tone, setTone] = useState<ReviewTone>("professional");
  const [length, setLength] = useState<ReviewLength>("detailed");
  const [text, setText] = useState("");
  const [templateId, setTemplateId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [thinking, setThinking] = useState("");
  const [logoFailed, setLogoFailed] = useState(false);

  useEffect(() => {
    void recordScanAction(publicId);
  }, [publicId]);

  async function generate() {
    if (!rating) {
      setError("Choose a star rating first.");
      return;
    }
    setBusy(true);
    setError("");
    setMessage("");
    const steps = ["Reading your stars", "Matching the tone", "Writing your review"];
    let step = 0;
    setThinking(steps[0]);
    const timer = window.setInterval(() => {
      step = Math.min(step + 1, steps.length - 1);
      setThinking(steps[step]);
    }, 700);
    const started = Date.now();
    try {
      const result = await generateDraftAction({
        publicId,
        rating,
        attributeKeys: [],
        language,
        tone,
        length,
        excludeTemplateId: templateId ?? "",
        companyWebsite: "",
      });
      const remaining = 2100 - (Date.now() - started);
      if (remaining > 0) await new Promise((resolve) => setTimeout(resolve, remaining));
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setText(result.text);
      setTemplateId(result.templateId);
    } catch {
      setError("Could not generate a review. Try again.");
    } finally {
      window.clearInterval(timer);
      setThinking("");
      setBusy(false);
    }
  }

  async function copyText() {
    if (!text.trim()) return;
    try {
      await navigator.clipboard.writeText(text);
      await trackReviewAction(publicId, "COPY");
      setMessage("Copied. Paste it yourself if you decide to post.");
    } catch {
      setMessage("Copy was blocked by the browser. Select the text and copy it manually.");
    }
  }

  async function openGoogle() {
    if (!text.trim() || !googleReviewUrl) return;
    try {
      await navigator.clipboard.writeText(text);
      await trackReviewAction(publicId, "COPY");
      await trackReviewAction(publicId, "GOOGLE_CLICK");
      setMessage("Copied. Google will open so you can paste and submit the review yourself.");
    } catch {
      await trackReviewAction(publicId, "GOOGLE_CLICK");
      setMessage("Google will open. Copy the review first, then paste it yourself.");
    }
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  const showLogo = Boolean(logoUrl) && !logoFailed;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-lg">
      <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_24px_70px_rgba(67,56,202,0.14)] ring-1 ring-stone-200/80">
        <div className="bg-gradient-to-br from-indigo-700 via-indigo-600 to-violet-500 px-4 pb-3 pt-3 text-white">
          <div className="flex items-center gap-3">
            {showLogo ? (
              // Logos are user uploads served by our media route.
              // eslint-disable-next-line @next/next/no-img-element
              <img src={logoUrl ?? ""} alt="" onError={() => setLogoFailed(true)} className="size-11 shrink-0 rounded-2xl object-cover ring-1 ring-white/40" />
            ) : (
              <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-sm font-semibold tracking-wide text-white ring-1 ring-white/30">
                {placeInitials(placeName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-100">{categoryName}</p>
              <h1 className="break-words font-display text-xl leading-tight">{placeName}</h1>
            </div>
          </div>
          {address ? <p className="mt-2 text-xs leading-4 text-indigo-100">{address}</p> : null}
        </div>

        <div className="px-3 py-3">
        <p className="text-sm leading-snug text-stone-800">{welcome}</p>
        <p className="mt-1 text-xs leading-4 text-stone-500">Pick the stars that match your visit. You can edit the review before you copy it.</p>

        <div className="mt-3 flex justify-between" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-label={`${value} star`}
              aria-checked={rating === value}
              onClick={() => setRating(value)}
              className={`flex size-9 items-center justify-center rounded-full ${value <= rating ? "bg-amber-50" : "bg-stone-50"}`}
            >
              <Star className={`size-4 ${value <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"}`} />
            </button>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)_minmax(0,1fr)] gap-1.5 text-[11px]">
          <select className={selectClass} value={language} onChange={(event) => setLanguage(event.target.value as ReviewLanguage)} aria-label="Language">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
          <select className={selectClass} value={tone} onChange={(event) => setTone(event.target.value as ReviewTone)} aria-label="Tone">
            <option value="natural">Natural</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="simple">Simple</option>
          </select>
          <select className={selectClass} value={length} onChange={(event) => setLength(event.target.value as ReviewLength)} aria-label="Length">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <button type="button" onClick={() => void generate()} disabled={busy} className="mt-3 h-10 w-full rounded-full bg-stone-950 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "AI is thinking…" : "Generate Review"}
        </button>

        {busy ? <ThinkingPanel label={thinking} /> : null}
        {!busy && text ? (
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} className="mt-3 w-full rounded-2xl border border-stone-200 p-3 text-sm leading-5" aria-label="Review" />
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-emerald-700">
            <Check size={16} className="mt-0.5 shrink-0" /> {message}
          </p>
        ) : null}

        {!busy && text ? (
          <div className="mt-3 grid gap-2">
            <button type="button" onClick={() => void copyText()} className="flex h-10 items-center justify-center gap-2 rounded-full bg-indigo-700 text-sm font-semibold text-white">
              <Copy size={15} /> Copy review
            </button>
            <button type="button" onClick={() => void generate()} disabled={busy} className="flex h-10 items-center justify-center gap-2 rounded-full bg-stone-100 text-sm font-semibold disabled:opacity-60">
              <RefreshCw size={15} /> Another variation
            </button>
            <button
              type="button"
              disabled={!googleReviewUrl}
              onClick={() => void openGoogle()}
              className="flex h-10 items-center justify-center gap-2 rounded-full bg-amber-400 text-sm font-semibold text-stone-950 disabled:opacity-50"
            >
              <ExternalLink size={16} /> Continue to Google Reviews
            </button>
            {!googleReviewUrl ? <p className="text-center text-xs text-stone-500">This location has not added a Google review link yet.</p> : null}
          </div>
        ) : null}
        <p className="mt-3 text-center text-[11px] leading-4 text-stone-500">
          Edit the review so it stays true. Qrate does not submit reviews. You paste and post on Google yourself.
        </p>
        <DigiHubMark className="mt-2 text-center text-[11px] font-semibold tracking-wide text-stone-500" />
        </div>
      </div>
    </motion.div>
  );
}

const selectClass =
  "h-9 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-1.5 text-[11px] text-stone-800 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100";

function placeInitials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => [...word][0] ?? "")
    .filter(Boolean)
    .slice(0, 2);
  return letters.join("").toUpperCase() || "?";
}

function ThinkingPanel({ label }: { label: string }) {
  return (
    <div className="mt-4 rounded-2xl border border-indigo-100 bg-indigo-50/80 p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm font-semibold text-indigo-950">
        <Sparkles size={16} className="animate-pulse" />
        AI is thinking
        <span className="inline-flex items-end gap-1" aria-hidden>
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:150ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-600 [animation-delay:300ms]" />
        </span>
      </div>
      <p className="mt-2 text-sm text-indigo-900/80">{label}</p>
      <div className="mt-3 space-y-2" aria-hidden>
        <div className="h-2 w-11/12 animate-pulse rounded-full bg-indigo-200" />
        <div className="h-2 w-full animate-pulse rounded-full bg-indigo-200/80" />
        <div className="h-2 w-2/3 animate-pulse rounded-full bg-indigo-200/70" />
      </div>
    </div>
  );
}
