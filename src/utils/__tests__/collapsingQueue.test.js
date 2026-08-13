import { collapsingQueue } from "../collapsingQueue";

// A queued run starts a microtask after the previous one settles; a macrotask
// hop guarantees it has by the time the test looks.
const tick = () => new Promise((resolve) => setTimeout(resolve, 0));

// Builds a run whose settlement each test controls, instrumented so overlap
// is a hard failure rather than something inferred from call counts.
const instrumentedRun = () => {
  let active = 0;
  let maxActive = 0;
  const settlers = [];
  const run = jest.fn(() => {
    active += 1;
    maxActive = Math.max(maxActive, active);
    return new Promise((resolve, reject) => {
      settlers.push({
        resolve: (value) => { active -= 1; resolve(value); },
        reject: (err) => { active -= 1; reject(err); },
      });
    });
  });
  return { run, settlers, maxActive: () => maxActive };
};

describe("collapsingQueue", () => {
  it("runs immediately when idle and resolves with the run's value", async () => {
    const { run, settlers } = instrumentedRun();
    const queued = collapsingQueue(run);

    const result = queued();
    expect(run).toHaveBeenCalledTimes(1);

    settlers[0].resolve("fresh");
    await expect(result).resolves.toBe("fresh");
  });

  it("queues a call arriving mid-run instead of starting a second run", async () => {
    const { run, settlers } = instrumentedRun();
    const queued = collapsingQueue(run);

    const first = queued();
    const second = queued();
    expect(run).toHaveBeenCalledTimes(1);

    settlers[0].resolve("a");
    await expect(first).resolves.toBe("a");
    await tick(); // the queued run starts only once the first has settled
    expect(run).toHaveBeenCalledTimes(2);

    settlers[1].resolve("b");
    await expect(second).resolves.toBe("b");
  });

  it("collapses every caller waiting on a not-yet-started run onto it", async () => {
    const { run, settlers } = instrumentedRun();
    const queued = collapsingQueue(run);

    queued();
    const second = queued();
    const third = queued();
    expect(third).toBe(second);

    settlers[0].resolve();
    await tick();
    settlers[1].resolve();
    await second;
    expect(run).toHaveBeenCalledTimes(2);
  });

  it("never overlaps runs, even for a caller arriving while the queued run is on the wire", async () => {
    // The case a two-flag implementation gets wrong: run 1 settled and cleared
    // its flag, run 2 is on the wire, a new caller sees "nothing in flight"
    // and starts run 3 concurrently. Overlap aborts run 2 at the request
    // layer and strands its callers forever.
    const { run, settlers, maxActive } = instrumentedRun();
    const queued = collapsingQueue(run);

    const first = queued();
    const second = queued();
    settlers[0].resolve();
    await first;
    await tick(); // run 2 is now on the wire

    const third = queued();
    expect(third).not.toBe(second);

    settlers[1].resolve();
    await second;
    await tick(); // run 3 starts
    settlers[2].resolve();
    await third;

    expect(run).toHaveBeenCalledTimes(3);
    expect(maxActive()).toBe(1);
  });

  it("rejects for the callers of a failed run without wedging the queue", async () => {
    const { run, settlers } = instrumentedRun();
    const queued = collapsingQueue(run);

    const failing = queued();
    settlers[0].reject(new Error("boom"));
    await expect(failing).rejects.toThrow("boom");

    const next = queued();
    settlers[1].resolve("recovered");
    await expect(next).resolves.toBe("recovered");
  });

  it("answers each caller from the run that served them", async () => {
    const { run, settlers } = instrumentedRun();
    const queued = collapsingQueue(run);

    const first = queued();
    const second = queued();
    settlers[0].resolve("stale");
    await first;
    await tick();
    settlers[1].resolve("fresh");

    await expect(first).resolves.toBe("stale");
    await expect(second).resolves.toBe("fresh");
  });
});
