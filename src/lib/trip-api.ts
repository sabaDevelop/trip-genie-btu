import { TRIPGENIE_API_URL, isApiConfigured } from "./api-config";

export type TripRequest = {
  destination: string;
  days: number;
  budget: number;
  description: string;
};

export type ItineraryDay = {
  day?: number;
  title?: string;
  activities?: string[];
};

export type Restaurant = {
  name?: string;
  cuisine?: string;
  note?: string;
};

export type HiddenGem = {
  name?: string;
  description?: string;
};

// Loose shape — we only render sections that actually come back.
export type Itinerary = {
  summary?: string;
  days?: ItineraryDay[];
  restaurants?: Restaurant[];
  hiddenGems?: HiddenGem[];
  packingList?: string[];
  travelTips?: string[];
};

export class TripApiError extends Error {}

// Best-effort normalizer so we never crash on unexpected keys/shapes.
function normalize(raw: unknown): Itinerary {
  if (!raw || typeof raw !== "object") return {};
  const r = raw as Record<string, unknown>;

  // Unwrap common wrappers ({ data: ... }, { itinerary: ... }, [ ... ])
  if (Array.isArray(raw) && raw.length > 0) return normalize(raw[0]);
  if (r.data && typeof r.data === "object") return normalize(r.data);
  if (r.itinerary && typeof r.itinerary === "object") return normalize(r.itinerary);
  if (r.result && typeof r.result === "object") return normalize(r.result);

  const asStrArray = (v: unknown): string[] | undefined => {
    if (!Array.isArray(v)) return undefined;
    const out = v
      .map((x) => (typeof x === "string" ? x : typeof x === "object" && x ? String((x as any).text ?? (x as any).item ?? "") : ""))
      .filter((s): s is string => Boolean(s));
    return out.length ? out : undefined;
  };

  const days = Array.isArray(r.days ?? r.dailyItinerary ?? r.itineraryDays)
    ? ((r.days ?? r.dailyItinerary ?? r.itineraryDays) as unknown[])
        .map((d, i): ItineraryDay | null => {
          if (!d || typeof d !== "object") return null;
          const o = d as Record<string, unknown>;
          const activities =
            asStrArray(o.activities) ??
            asStrArray(o.plan) ??
            asStrArray(o.items) ??
            [];
          return {
            day: typeof o.day === "number" ? o.day : i + 1,
            title: typeof o.title === "string" ? o.title : `Day ${i + 1}`,
            activities,
          };
        })
        .filter((x): x is ItineraryDay => x !== null)
    : undefined;

  const restaurants = Array.isArray(r.restaurants)
    ? (r.restaurants as unknown[])
        .map((x): Restaurant | null => {
          if (!x || typeof x !== "object") return null;
          const o = x as Record<string, unknown>;
          const name = typeof o.name === "string" ? o.name : undefined;
          if (!name) return null;
          return {
            name,
            cuisine: typeof o.cuisine === "string" ? o.cuisine : undefined,
            note:
              typeof o.note === "string"
                ? o.note
                : typeof o.description === "string"
                  ? (o.description as string)
                  : undefined,
          };
        })
        .filter((x): x is Restaurant => x !== null)
    : undefined;

  const hiddenGems = Array.isArray(r.hiddenGems ?? r.hidden_gems)
    ? ((r.hiddenGems ?? r.hidden_gems) as unknown[])
        .map((x): Restaurant | null => {
          if (!x || typeof x !== "object") return null;
          const o = x as Record<string, unknown>;
          const name = typeof o.name === "string" ? o.name : undefined;
          if (!name) return null;
          return {
            name,
            description:
              typeof o.description === "string" ? o.description : undefined,
          };
        })
        .filter((x): x is HiddenGem => x !== null)
    : undefined;

  return {
    summary:
      typeof r.summary === "string"
        ? r.summary
        : typeof r.tripSummary === "string"
          ? (r.tripSummary as string)
          : undefined,
    days: days && days.length ? days : undefined,
    restaurants: restaurants && restaurants.length ? restaurants : undefined,
    hiddenGems: hiddenGems && hiddenGems.length ? hiddenGems : undefined,
    packingList: asStrArray(r.packingList ?? r.packing_list),
    travelTips: asStrArray(r.travelTips ?? r.travel_tips ?? r.tips),
  };
}

export function isEmptyItinerary(it: Itinerary): boolean {
  return (
    !it.summary &&
    !it.days?.length &&
    !it.restaurants?.length &&
    !it.hiddenGems?.length &&
    !it.packingList?.length &&
    !it.travelTips?.length
  );
}

export async function generateTrip(input: TripRequest): Promise<Itinerary> {
  if (!isApiConfigured()) {
    throw new TripApiError(
      "The trip API isn't configured yet. Set VITE_TRIPGENIE_API_URL to your backend endpoint (e.g. your n8n webhook URL).",
    );
  }

  let res: Response;
  try {
    res = await fetch(TRIPGENIE_API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(input),
    });
  } catch (err) {
    throw new TripApiError(
      "We couldn't reach the trip service. Please check your connection and try again.",
    );
  }

  if (!res.ok) {
    let detail = "";
    try {
      const text = await res.text();
      detail = text.slice(0, 200);
    } catch {
      /* ignore */
    }
    throw new TripApiError(
      `The trip service responded with an error (${res.status})${detail ? `: ${detail}` : "."}`,
    );
  }

  let raw: unknown;
  try {
    const text = await res.text();
    raw = text ? JSON.parse(text) : {};
  } catch {
    throw new TripApiError("The trip service returned an unexpected response.");
  }

  const itinerary = normalize(raw);
  if (isEmptyItinerary(itinerary)) {
    throw new TripApiError(
      "The trip service returned an empty itinerary. Please try again with more detail.",
    );
  }
  return itinerary;
}
