// Single source of truth for the TripGenie backend endpoint.
// TEMPORARY: hardcoded n8n webhook for testing. Swap to an env var later.

export const TRIPGENIE_API_URL: string =
  "https://sababtu.app.n8n.cloud/webhook/trip";

export const isApiConfigured = () => TRIPGENIE_API_URL.length > 0;
