import eventReducer from "../event-reducer";
import { RELOAD_EVENT_STATE } from "../../actions/event-actions-definitions";
import { SYNC_DATA } from "../../actions/base-actions-definitions";

// the overflow page loads its event from the overflow endpoint, the only source of these fields
const overflowEvent = {
  id: 7813,
  title: "Opening Remarks",
  start_date: 100,
  end_date: 200,
  overflow_streaming_url: "https://stream.example.com/overflow.m3u8",
  overflow_stream_is_secure: false,
  overflow_url: "https://site.example.com/a/overflow-player?k=abc",
  overflow_tokens: [],
};
const state = { loading: false, event: overflowEvent, lastUpdate: null, tokens: null, error: null };

// the published event, as re-fetched after a push: no overflow fields
const refetched = { id: 7813, title: "Opening Remarks (updated)", start_date: 100, end_date: 200 };

describe("eventReducer keeps the overflow stream on updates", () => {
  it("keeps the overflow fields on RELOAD_EVENT_STATE", () => {
    const next = eventReducer(state, { type: RELOAD_EVENT_STATE, payload: refetched });
    expect(next.event.title).toBe("Opening Remarks (updated)");
    expect(next.event.overflow_streaming_url).toBe(overflowEvent.overflow_streaming_url);
    expect(next.event.overflow_stream_is_secure).toBe(false);
    expect(next.event.overflow_url).toBe(overflowEvent.overflow_url);
    expect(next.event.overflow_tokens).toEqual([]);
  });

  it("keeps the overflow fields on SYNC_DATA", () => {
    const eventsData = [{ id: 1, title: "Other" }, refetched];
    const next = eventReducer(state, { type: SYNC_DATA, payload: { eventsData, eventsIDXData: { 1: 0, 7813: 1 } } });
    expect(next.event.title).toBe("Opening Remarks (updated)");
    expect(next.event.overflow_streaming_url).toBe(overflowEvent.overflow_streaming_url);
  });

  it("takes overflow fields that the update does send", () => {
    const payload = { ...refetched, overflow_streaming_url: "https://stream.example.com/new.m3u8" };
    const next = eventReducer(state, { type: RELOAD_EVENT_STATE, payload });
    expect(next.event.overflow_streaming_url).toBe("https://stream.example.com/new.m3u8");
  });

  it("does not copy overflow fields onto a different event", () => {
    const next = eventReducer(state, { type: RELOAD_EVENT_STATE, payload: { id: 7879, title: "Welcome Address" } });
    expect(next.event.overflow_streaming_url).toBeUndefined();
  });
});
