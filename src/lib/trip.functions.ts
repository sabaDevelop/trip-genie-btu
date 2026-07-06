import { createServerFn } from "@tanstack/react-start";
import { generateText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export const TripInputSchema = z.object({
  destination: z.string().trim().min(1).max(120),
  days: z.number().int().min(1).max(60),
  budget: z.number().int().min(1).max(1_000_000),
  travelers: z.number().int().min(1).max(50),
  style: z.enum([
    "Adventure",
    "Luxury",
    "Budget",
    "Romantic",
    "Family",
    "Nature",
    "Beach",
  ]),
  transportation: z.enum(["Plane", "Train", "Car"]),
  interests: z.array(z.string()).max(20),
  notes: z.string().max(2000).optional().default(""),
});

export type TripInput = z.infer<typeof TripInputSchema>;

const ItinerarySchema = z.object({
  summary: z.string().describe("A 2-4 sentence overview of the trip"),
  days: z
    .array(
      z.object({
        day: z.number().int(),
        title: z.string(),
        activities: z.array(z.string()),
      }),
    )
    .describe("One entry per day of the trip"),
  budgetTips: z.array(z.string()).optional(),
  restaurants: z
    .array(
      z.object({
        name: z.string(),
        cuisine: z.string().optional(),
        note: z.string().optional(),
      }),
    )
    .optional(),
  hiddenGems: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .optional(),
  packingList: z.array(z.string()).optional(),
  travelTips: z.array(z.string()).optional(),
});

export type Itinerary = z.infer<typeof ItinerarySchema>;

export const generateTrip = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => TripInputSchema.parse(data))
  .handler(async ({ data }): Promise<Itinerary> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("AI service is not configured.");

    const gateway = createLovableAiGatewayProvider(key);

    const prompt = `Plan a detailed ${data.days}-day trip to ${data.destination} for ${data.travelers} traveler(s).
Travel style: ${data.style}. Transportation preference: ${data.transportation}.
Total budget: $${data.budget} USD.
Interests: ${data.interests.length ? data.interests.join(", ") : "general sightseeing"}.
Additional notes from the traveler: ${data.notes?.trim() || "none"}.

Return a comprehensive itinerary with:
- A concise trip summary
- A day-by-day plan (exactly ${data.days} day entries) with a title and 3-6 concrete activities each
- Practical budget tips tailored to the total budget
- 3-6 recommended restaurants (name + cuisine + short note)
- 3-5 hidden gems most tourists miss
- A packing list (10-15 items) appropriate for the destination and style
- 5-8 travel tips specific to the destination

Be specific, use real place names when possible, and keep suggestions realistic for the budget.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-2.5-flash"),
        output: Output.object({ schema: ItinerarySchema }),
        prompt,
      });
      return output;
    } catch (err) {
      const status = (err as { status?: number; statusCode?: number })?.status ??
        (err as { statusCode?: number })?.statusCode;
      if (status === 429) {
        throw new Error("The AI is a bit busy right now. Please try again in a moment.");
      }
      if (status === 402) {
        throw new Error("AI credits have been exhausted for this workspace.");
      }
      console.error("generateTrip failed", err);
      throw new Error("Failed to generate itinerary. Please try again.");
    }
  });
