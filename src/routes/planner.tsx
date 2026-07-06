import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { generateTrip, type TripRequest } from "@/lib/trip-api";
import { tripStore } from "@/lib/trip-store";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "Planner · TripGenie AI" },
      {
        name: "description",
        content:
          "Describe your dream vacation and TripGenie AI will craft a personalized itinerary in seconds.",
      },
      { property: "og:title", content: "Planner · TripGenie AI" },
      {
        property: "og:description",
        content: "Describe your dream vacation and get a full itinerary in seconds.",
      },
    ],
  }),
  component: PlannerPage,
});

const QUICK_IDEAS: { label: string; sentence: string }[] = [
  { label: "Food Lover", sentence: "I would like to discover authentic local food." },
  { label: "Photography", sentence: "I would love beautiful photography locations." },
  { label: "Adventure", sentence: "I want thrilling outdoor adventures." },
  { label: "Luxury", sentence: "I prefer a luxurious, high-end experience." },
  { label: "Romantic", sentence: "I'm planning a romantic getaway for two." },
  { label: "Nature", sentence: "I want to spend time immersed in nature." },
  { label: "Beach Escape", sentence: "I'd love relaxing time by the sea." },
  { label: "Family", sentence: "This trip is for the whole family, kids included." },
];

type Errors = Partial<Record<"destination" | "days" | "description", string>>;

function PlannerPage() {
  const navigate = useNavigate();

  const [destination, setDestination] = useState("");
  const [days, setDays] = useState("5");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const appendChip = (sentence: string) => {
    setDescription((prev) => {
      if (prev.includes(sentence)) return prev;
      const sep = prev.trim().length === 0 ? "" : prev.endsWith(" ") ? "" : " ";
      return prev + sep + sentence;
    });
  };

  const validate = (): TripRequest | null => {
    const e: Errors = {};
    const dest = destination.trim();
    const desc = description.trim();
    const daysNum = Number(days);
    const budgetNum = budget.trim() === "" ? 0 : Number(budget);

    if (!dest) e.destination = "Please enter a destination.";
    else if (dest.length > 120) e.destination = "Destination is too long.";

    if (!days.trim() || !Number.isFinite(daysNum) || daysNum < 1)
      e.days = "Enter a number of days (minimum 1).";
    else if (daysNum > 60) e.days = "That's a very long trip — try 60 days or fewer.";

    if (!desc) e.description = "Tell us a bit about your dream trip.";
    else if (desc.length > 2000) e.description = "Please keep it under 2000 characters.";

    if (budget.trim() !== "" && (!Number.isFinite(budgetNum) || budgetNum < 0)) {
      // silently coerce; not shown as an inline error since budget is optional
    }

    setErrors(e);
    if (Object.keys(e).length > 0) return null;

    return {
      destination: dest,
      days: Math.floor(daysNum),
      budget: Math.max(0, Math.floor(budgetNum || 0)),
      description: desc,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);
    const payload = validate();
    if (!payload) return;

    setLoading(true);
    try {
      const itinerary = await generateTrip(payload);
      tripStore.set({ itinerary, input: payload });
      navigate({ to: "/results" });
    } catch (err) {
      setApiError(
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
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
          Describe your dream vacation — the more detail, the better your itinerary.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass mt-10 rounded-3xl p-6 sm:p-10" noValidate>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Destination" required error={errors.destination} className="sm:col-span-2">
            <input
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                if (errors.destination) setErrors((x) => ({ ...x, destination: undefined }));
              }}
              placeholder="Where would you like to go?"
              className="input"
              maxLength={120}
              aria-invalid={!!errors.destination}
            />
          </Field>

          <Field label="Number of Days" required error={errors.days}>
            <input
              type="number"
              min={1}
              max={60}
              value={days}
              onChange={(e) => {
                setDays(e.target.value);
                if (errors.days) setErrors((x) => ({ ...x, days: undefined }));
              }}
              className="input"
              aria-invalid={!!errors.days}
            />
          </Field>

          <Field label="Budget (USD)" hint="Optional">
            <input
              type="number"
              min={0}
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="e.g. 1500"
              className="input"
            />
          </Field>

          <Field label="Dream Trip" required error={errors.description} className="sm:col-span-2">
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (errors.description) setErrors((x) => ({ ...x, description: undefined }));
              }}
              placeholder="Describe your ideal vacation. e.g. I want to explore local culture, avoid tourist crowds, eat authentic food, take beautiful photos, relax by the sea and discover hidden places."
              rows={6}
              maxLength={2000}
              className="input resize-none"
              aria-invalid={!!errors.description}
            />
            <div className="mt-1 text-right text-xs text-muted-foreground">
              {description.length}/2000
            </div>
          </Field>

          <div className="sm:col-span-2">
            <div className="mb-2 text-sm font-medium text-foreground/80">Quick Ideas</div>
            <div className="flex flex-wrap gap-2">
              {QUICK_IDEAS.map((c) => (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => appendChip(c.sentence)}
                  className="rounded-full border border-border bg-white/60 px-4 py-1.5 text-sm text-foreground transition hover:bg-white hover:-translate-y-0.5"
                >
                  + {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {apiError && (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {apiError}
          </div>
        )}

        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-70"
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
  hint,
  required,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={"block " + className}>
      <span className="mb-1.5 flex items-center justify-between text-sm font-medium text-foreground/80">
        <span>
          {label}
          {required && <span className="ml-0.5 text-destructive">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
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
