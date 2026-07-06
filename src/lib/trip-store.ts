import { useSyncExternalStore } from "react";
import type { Itinerary, TripInput } from "./trip.functions";

type State = {
  itinerary: Itinerary | null;
  input: TripInput | null;
};

let state: State = { itinerary: null, input: null };
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

export const tripStore = {
  get: () => state,
  set: (next: State) => {
    state = next;
    emit();
  },
  clear: () => {
    state = { itinerary: null, input: null };
    emit();
  },
  subscribe: (l: () => void) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};

const serverSnapshot: State = { itinerary: null, input: null };

export function useTrip() {
  return useSyncExternalStore(
    tripStore.subscribe,
    tripStore.get,
    () => serverSnapshot,
  );
}
