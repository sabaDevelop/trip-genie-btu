import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useTrip, tripStore } from "@/lib/trip-store";

export const Route = createFileRoute("/results")({
  head: () => ({
    meta: [
      { title: "Your itinerary · TripGenie AI" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResultsPage,
});

function ResultsPage() {
  const { itinerary, input } = useTrip();
  const navigate = useNavigate();

  useEffect(() => {
    if (!itinerary) navigate({ to: "/planner" });
  }, [itinerary, navigate]);

  if (!itinerary || !input) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center text-muted-foreground">
        No itinerary yet. Redirecting to the planner…
      </div>
    );
  }

  const generateAgain = () => {
    tripStore.clear();
    navigate({ to: "/planner" });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pb-24 pt-10">
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full glass-soft px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          Your personalized plan
        </div>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
          {input.destination}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {input.days} {input.days === 1 ? "day" : "days"}
          {input.budget > 0 ? ` · $${input.budget.toLocaleString()} budget` : ""}
        </p>
      </div>

      <Section title="Trip Summary" show={!!itinerary.summary}>
        <p className="text-[15px] leading-relaxed text-foreground/85">
          {itinerary.summary}
        </p>
      </Section>

      <Section title="Daily Itinerary" show={!!itinerary.days?.length}>
        <ol className="space-y-4">
          {itinerary.days?.map((d, idx) => (
            <li
              key={idx}
              className="rounded-2xl border border-border/60 bg-white/60 p-5"
            >
              <div className="flex items-baseline gap-3">
                <span className="grid h-8 w-8 place-items-center rounded-xl btn-primary text-xs font-semibold">
                  {String(d.day ?? idx + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-semibold">
                  {d.title || `Day ${d.day ?? idx + 1}`}
                </h3>
              </div>
              {d.activities && d.activities.length > 0 && (
                <ul className="mt-3 space-y-1.5 pl-11 text-sm text-foreground/80">
                  {d.activities.map((a, i) => (
                    <li key={i} className="list-disc">
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Recommended Restaurants" show={!!itinerary.restaurants?.length}>
        <div className="grid gap-3 sm:grid-cols-2">
          {itinerary.restaurants?.map((r, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-white/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <h4 className="font-semibold">{r.name}</h4>
                {r.cuisine && (
                  <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs text-accent-foreground">
                    {r.cuisine}
                  </span>
                )}
              </div>
              {r.note && (
                <p className="mt-1.5 text-sm text-muted-foreground">{r.note}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Hidden Gems" show={!!itinerary.hiddenGems?.length}>
        <div className="space-y-3">
          {itinerary.hiddenGems?.map((g, i) => (
            <div key={i} className="rounded-2xl border border-border/60 bg-white/60 p-4">
              <h4 className="font-semibold">✨ {g.name}</h4>
              {g.description && (
                <p className="mt-1 text-sm text-muted-foreground">{g.description}</p>
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Packing List" show={!!itinerary.packingList?.length}>
        <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
          {itinerary.packingList?.map((p, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-xl border border-border/60 bg-white/60 px-3 py-2 text-sm"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-teal" /> {p}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Travel Tips" show={!!itinerary.travelTips?.length}>
        <ul className="space-y-2">
          {itinerary.travelTips?.map((t, i) => (
            <li
              key={i}
              className="rounded-xl border border-border/60 bg-white/60 p-3 text-sm"
            >
              🧭 {t}
            </li>
          ))}
        </ul>
      </Section>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={generateAgain}
          className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
        >
          Generate Another Trip
        </button>
        <Link
          to="/"
          className="btn-ghost inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

function Section({
  title,
  show,
  children,
}: {
  title: string;
  show: boolean;
  children: React.ReactNode;
}) {
  if (!show) return null;
  return (
    <section className="glass mt-6 rounded-3xl p-6 sm:p-8">
      <h2 className="mb-4 text-xl font-semibold tracking-tight">{title}</h2>
      {children}
    </section>
  );
}
