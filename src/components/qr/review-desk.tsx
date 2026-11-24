"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, ExternalLink, RefreshCw, Star } from "lucide-react";
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
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setText(result.text);
    setTemplateId(result.templateId);
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
      setMessage("Google will open. Copy the draft first, then paste it yourself.");
    }
    window.open(googleReviewUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto w-full max-w-md px-4 py-8">
      <div className="rounded-[2rem] bg-white p-5 shadow-[0_20px_60px_rgba(67,56,202,0.12)] ring-1 ring-stone-200">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            // Logos are user uploads served by our media route.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="" className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-700 font-display text-2xl text-white">
              {placeName.slice(0, 1)}
            </div>
          )}
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">{categoryName}</p>
            <h1 className="font-display text-3xl leading-none">{placeName}</h1>
            {address ? <p className="text-sm text-stone-500">{address}</p> : null}
          </div>
        </div>
        <p className="mt-5 text-lg text-stone-800">{welcome}</p>
        <p className="mt-1 text-sm text-stone-500">Pick the stars that match your visit. You can edit the draft before you copy it.</p>

        <div className="mt-5 flex justify-between" role="radiogroup" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              type="button"
              aria-label={`${value} star`}
              onClick={() => setRating(value)}
              className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50"
            >
              <Star className={value <= rating ? "fill-amber-400 text-amber-400" : "text-stone-300"} />
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
          <select className="rounded-xl border border-stone-200 px-2 py-2" value={language} onChange={(event) => setLanguage(event.target.value as ReviewLanguage)} aria-label="Language">
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
          <select className="rounded-xl border border-stone-200 px-2 py-2" value={tone} onChange={(event) => setTone(event.target.value as ReviewTone)} aria-label="Tone">
            <option value="natural">Natural</option>
            <option value="professional">Professional</option>
            <option value="friendly">Friendly</option>
            <option value="simple">Simple</option>
          </select>
          <select className="rounded-xl border border-stone-200 px-2 py-2" value={length} onChange={(event) => setLength(event.target.value as ReviewLength)} aria-label="Length">
            <option value="short">Short</option>
            <option value="medium">Medium</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>

        <button type="button" onClick={() => void generate()} disabled={busy} className="mt-4 h-12 w-full rounded-full bg-stone-950 text-sm font-semibold text-white disabled:opacity-60">
          {busy ? "Writing a draft…" : text ? "Generate another variation" : "Write a draft from my answers"}
        </button>

        {text ? (
          <textarea value={text} onChange={(event) => setText(event.target.value)} rows={7} className="mt-4 w-full rounded-2xl border border-stone-200 p-3 text-base leading-6" aria-label="Review draft" />
        ) : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
        {message ? (
          <p className="mt-3 flex items-start gap-2 text-sm text-emerald-700">
            <Check size={16} className="mt-0.5 shrink-0" /> {message}
          </p>
        ) : null}

        {text ? (
          <div className="mt-4 grid gap-2">
            <button type="button" onClick={() => void copyText()} className="flex h-12 items-center justify-center gap-2 rounded-full bg-indigo-700 text-sm font-semibold text-white">
              <Copy size={16} /> Copy review
            </button>
            <button type="button" onClick={() => void generate()} className="flex h-12 items-center justify-center gap-2 rounded-full bg-stone-100 text-sm font-semibold">
              <RefreshCw size={16} /> Another variation
            </button>
            <button
              type="button"
              disabled={!googleReviewUrl}
              onClick={() => void openGoogle()}
              className="flex h-12 items-center justify-center gap-2 rounded-full bg-amber-400 text-sm font-semibold text-stone-950 disabled:opacity-50"
            >
              <ExternalLink size={16} /> Continue to Google Reviews
            </button>
            {!googleReviewUrl ? <p className="text-center text-xs text-stone-500">This location has not added a Google review link yet.</p> : null}
          </div>
        ) : null}
        <p className="mt-5 text-center text-xs leading-5 text-stone-500">
          Edit the draft so it stays true. Qrate does not submit reviews. You paste and post on Google yourself.
        </p>
        <DigiHubMark className="mt-3 text-center text-xs font-semibold tracking-wide text-stone-500" />
      </div>
    </motion.div>
  );
}
