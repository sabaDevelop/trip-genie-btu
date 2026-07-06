import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-14 sm:pt-20">
      <section className="text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full glass-soft px-4 py-1.5 text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-teal" />
          AI-powered travel planning
        </div>
        <h1 className="mx-auto mt-6 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          Plan Your Perfect Trip{" "}
          <span className="gradient-text font-display italic">with AI</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Describe your dream vacation and receive a personalized travel
          itinerary in seconds.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            to="/planner"
            className="btn-primary inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium"
          >
            Start Planning
            <span aria-hidden>→</span>
          </Link>
        </div>
      </section>

      <section className="mt-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            How it works
          </h2>
          <p className="mt-3 text-muted-foreground">
            Three steps between you and your next adventure.
          </p>
        </div>

        <div className="mt-10 grid gap-5 sm:grid-cols-3">
          {[
            {
              n: "01",
              t: "Fill out the travel form",
              d: "Share your destination, dates, budget, and what you love to do.",
            },
            {
              n: "02",
              t: "AI analyzes your preferences",
              d: "Our travel AI combines your inputs into a personalized plan.",
            },
            {
              n: "03",
              t: "Receive your itinerary",
              d: "Get a beautiful day-by-day plan with tips, food, and hidden gems.",
            },
          ].map((s) => (
            <div
              key={s.n}
              className="glass group rounded-3xl p-6 transition hover:-translate-y-0.5"
            >
              <div className="inline-flex h-9 items-center rounded-full bg-white/70 px-3 text-xs font-semibold tracking-widest text-primary">
                STEP {s.n}
              </div>
              <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
