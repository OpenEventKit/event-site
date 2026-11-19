/**
 * After a push, ActivitySynchStrategy re-fetches the event. Only a 404 means the
 * event is no longer published. Any other failure must keep the event on the
 * schedule and in the cached files.
 */
import ActivitySynchStrategy from "../activity_synch_strategy";
import { saveFile } from "../../../utils/dataUpdatesUtils";

jest.mock("../../../utils/dataUpdatesUtils", () => ({
  ...jest.requireActual("../../../utils/dataUpdatesUtils"),
  saveFile: jest.fn(() => Promise.resolve()),
}));

const summit = { id: 73 };
const events = [
  { id: 1, title: "Keynote", start_date: 100, end_date: 200 },
  { id: 2, title: "Panel", start_date: 300, end_date: 400 },
];
const update = { entity_type: "Presentation", entity_operator: "UPDATE", entity_id: 2 };

const buildStrategy = () =>
  new ActivitySynchStrategy(summit, [...events], { 1: 0, 2: 1 }, [], {}, "token");

const respondWith = (status, body = {}) =>
  (global.fetch = jest.fn(() => Promise.resolve({ status, json: () => Promise.resolve(body) })));

beforeEach(() => jest.clearAllMocks());
afterAll(() => delete global.fetch);

describe("ActivitySynchStrategy re-fetch after a push", () => {
  it("updates the event on a 200", async () => {
    respondWith(200, { ...events[1], title: "Panel (moved)" });
    const res = await buildStrategy().process(update);
    expect(res.eventsData.find((e) => e.id === 2).title).toBe("Panel (moved)");
  });

  it("removes the event on a 404", async () => {
    respondWith(404);
    const res = await buildStrategy().process(update);
    expect(res.eventsData.map((e) => e.id)).toEqual([1]);
    expect(saveFile).toHaveBeenCalled();
  });

  it.each([401, 429, 500, 502, 503, 504])("keeps the event on a %i", async (status) => {
    respondWith(status);
    const strategy = buildStrategy();
    await expect(strategy.process(update)).rejects.toThrow(`returned ${status}`);
    expect(strategy.allEvents.map((e) => e.id)).toEqual([1, 2]);
    expect(saveFile).not.toHaveBeenCalled();
  });

  it("keeps the event when the request fails", async () => {
    global.fetch = jest.fn(() => Promise.reject(new TypeError("Failed to fetch")));
    const strategy = buildStrategy();
    await expect(strategy.process(update)).rejects.toThrow("Failed to fetch");
    expect(strategy.allEvents.map((e) => e.id)).toEqual([1, 2]);
    expect(saveFile).not.toHaveBeenCalled();
  });
});
