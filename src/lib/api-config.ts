// Single source of truth for the TripGenie backend endpoint.
// Replace via VITE_TRIPGENIE_API_URL to point at the n8n webhook
// (or any other JSON endpoint) without touching the rest of the app.

export const TRIPGENIE_API_URL: string =
  (import.meta.env.VITE_TRIPGENIE_API_URL as string | undefined)?.trim() || "";

export const isApiConfigured = () => TRIPGENIE_API_URL.length > 0;
