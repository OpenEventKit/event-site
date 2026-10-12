export const MAX_SYNC_DELAY_MS = 10000;

/**
 * A real-time push reaches every open tab in the same second, and each tab then
 * re-fetches the changed entity: one edit in the admin becomes thousands of
 * identical requests to the API. Waiting a random 0-10 s before the re-fetch
 * spreads them over that window. Every call draws its own delay.
 */
export const waitForSyncSpread = () =>
  new Promise((resolve) => {
    setTimeout(resolve, Math.floor(Math.random() * MAX_SYNC_DELAY_MS));
  });
