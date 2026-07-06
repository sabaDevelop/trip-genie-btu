import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { generateTrip, TripInputSchema, type TripInput } from "@/lib/trip.functions";
import { tripStore } from "@/lib/trip-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner · TripGenie AI" },
      {
        name: "description",
        content:
          "Tell TripGenie AI about your trip — destination, days, budget, style, and interests — and get a full itinerary in seconds.",
      },
      { property: "og:title", content: "Planner · TripGenie AI" },
      {
        property: "og:description",
        content: "Build a personalized AI-powered travel itinerary in seconds.",
      },
    ],
  }),
  component: PlannerPage,
});

const STYLES = [
  "Adventure",
  "Luxury",
  "Budget",
  "Romantic",
  "Family",
  "Nature",
  "Beach",
] as const;

const TRANSPORT = ["Plane", "Train", "Car"] as const;

const INTERESTS = [
  "Food",
  "History",
  "Museums",
  "Photography",
  "Shopping",
  "Nightlife",
  "Hiking",
  "Beaches",
] as const;

type FormState = {
  destination: string;
  days: string;
  budget: string;
  travelers: string;
  style: (typeof STYLES)[number];
  transportation: (typeof TRANSPORT)[number];
  interests: string[];
  notes: string;
};

const INITIAL: FormState = {
  destination: "",
  days: "5",
  budget: "1500",
  travelers: "2",
  style: "Adventure",
  transportation: "Plane",
  interests: [],
  notes: "",
};

function PlannerPage() {
  const navigate = useNavigate();
  const generate = useServerFn(generateTrip);

  const [form, setForm] = useState<FormState>(INITIAL);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const update = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => {
      if (!e[k as string]) return e;
      const { [k as string]: _, ...rest } = e;
      return rest;
    });
  };

  const toggleInterest = (i: string) => {
    setForm((f) => ({
      ...f,
      interests: f.interests.includes(i)
        ? f.interests.filter((x) => x !== i)
        : [...f.interests, i],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    const parsed = TripInputSchema.safeParse({
      destination: form.destination,
      days: Number(form.days),
      budget: Number(form.budget),
      travelers: Number(form.travelers),
      style: form.style,
      transportation: form.transportation,
      interests: form.interests,
      notes: form.notes,
    } satisfies TripInput);

    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!errs[key]) errs[key] = issue.message;
      }
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const itinerary = await generate({ data: parsed.data });
      tripStore.set({ itinerary, input: parsed.data });
      navigate({ to: "/results" });
    } catch (err) {
      setApiError(
        err instanceof Error
          ? err.message
          : "Something went wrong generating your trip.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pb-20 pt-10">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Design your <span className="gradient-text font-display italic">trip</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          The more we know, the better your itinerary will be.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="glass mt-10 rounded-3xl p-6 sm:p-10"
        noValidate
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Destination" error={errors.destination} className="sm:col-span-2">
            <input
              type="text"
              value={form.destination}
              onChange={(e) => update("destination", e.target.value)}
              placeholder="e.g. Kyoto, Japan"
              className="input"
              maxLength={120}
            />
          </Field>

          <Field label="Number of Days" error={errors.days}>
            <input
              type="number"
              min={1}
              max={60}
              value={form.days}
              onChange={(e) => update("days", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Budget (USD)" error={errors.budget}>
            <input
              type="number"
              min={1}
              value={form.budget}
              onChange={(e) => update("budget", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Travelers" error={errors.travelers}>
            <input
              type="number"
              min={1}
              max={50}
              value={form.travelers}
              onChange={(e) => update("travelers", e.target.value)}
              className="input"
            />
          </Field>

          <Field label="Travel Style" error={errors.style}>
            <select
              value={form.style}
              onChange={(e) =>
                update("style", e.target.value as FormState["style"])
              }
              className="input"
            >
              {STYLES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Transportation" error={errors.transportation} className="sm:col-span-2">
            <select
              value={form.transportation}
              onChange={(e) =>
                update(
                  "transportation",
                  e.target.value as FormState["transportation"],
                )
              }
              className="input"
            >
              {TRANSPORT.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Interests" className="sm:col-span-2">
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((i) => {
                const active = form.interests.includes(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleInterest(i)}
                    className={
                      "rounded-full border px-4 py-1.5 text-sm transition " +
                      (active
                        ? "border-transparent btn-primary"
                        : "border-border bg-white/60 text-foreground hover:bg-white")
                    }
                    aria-pressed={active}
                  >
                    {i}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field
            label="Additional Notes"
            error={errors.notes}
            className="sm:col-span-2"
          >
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              placeholder="Describe your dream vacation or any special requests."
              rows={5}
              maxLength={2000}
              className="input resize-none"
            />
          </Field>
        </div>

        {apiError && (
          <div className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {apiError}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
          >
            {loading ? (
              <>
                <Spinner /> Generating your trip…
              </>
            ) : (
              <>
                Generate Trip <span aria-hidden>✨</span>
              </>
            )}
          </button>
        </div>
      </form>

      <style>{`
        .input {
          width: 100%;
          border-radius: 0.9rem;
          border: 1px solid var(--color-border);
          background: color-mix(in oklab, white 75%, transparent);
          padding: 0.7rem 0.9rem;
          font-size: 0.95rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 150ms ease, box-shadow 150ms ease, background 150ms ease;
        }
        .input:focus {
          border-color: var(--color-ring);
          box-shadow: 0 0 0 4px color-mix(in oklab, var(--color-ring) 25%, transparent);
          background: white;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1.5 block text-sm font-medium text-foreground/80">
        {label}
      </span>
      {children}
      {error && (
        <span className="mt-1 block text-xs text-destructive">{error}</span>
      )}
    </label>
  );
}

function Spinner() {
  return (
    <span
      aria-hidden
      className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
    />
  );
}
