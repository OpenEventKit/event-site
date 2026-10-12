/**
 * A push reaches every open tab in the same second and each tab re-fetches the
 * changed entity, so one admin edit becomes thousands of identical requests to
 * the API. waitForSyncSpread makes a tab wait a random 0-10 s before it does.
 */
import { MAX_SYNC_DELAY_MS, waitForSyncSpread } from "../syncSpread";

describe("waitForSyncSpread", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  const settled = async (promise) => {
    let done = false;
    promise.then(() => {
      done = true;
    });
    await Promise.resolve();
    return () => done;
  };

  it("spreads the wait over 0 to 10 s", () => {
    expect(MAX_SYNC_DELAY_MS).toBe(10000);
  });

  it("waits exactly the drawn delay, not a millisecond less", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.5);

    const isDone = await settled(waitForSyncSpread());

    jest.advanceTimersByTime(4999);
    await Promise.resolve();
    expect(isDone()).toBe(false);

    jest.advanceTimersByTime(1);
    await Promise.resolve();
    expect(isDone()).toBe(true);
  });

  it("waits almost nothing when the draw is 0", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0);

    const isDone = await settled(waitForSyncSpread());

    jest.advanceTimersByTime(0);
    await Promise.resolve();
    expect(isDone()).toBe(true);
  });

  it("never waits 10 s or more, whatever the draw", async () => {
    jest.spyOn(Math, "random").mockReturnValue(0.9999999);

    const isDone = await settled(waitForSyncSpread());

    jest.advanceTimersByTime(MAX_SYNC_DELAY_MS - 1);
    await Promise.resolve();
    expect(isDone()).toBe(true);
  });

  it("gives each call its own draw, so concurrent tabs do not wait the same time", async () => {
    jest
      .spyOn(Math, "random")
      .mockReturnValueOnce(0.1)
      .mockReturnValueOnce(0.9);

    const first = await settled(waitForSyncSpread());
    const second = await settled(waitForSyncSpread());

    jest.advanceTimersByTime(1000);
    await Promise.resolve();
    expect(first()).toBe(true);
    expect(second()).toBe(false);

    jest.advanceTimersByTime(8000);
    await Promise.resolve();
    expect(second()).toBe(true);
  });
});
