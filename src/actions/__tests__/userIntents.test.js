/**
 * The schedule page paints "+" from the profile saved in the browser, which can
 * be days old. Clicking "+" on an event that is already in the server schedule
 * gets a 412; it must end with the button matching the server, not with a
 * silent "success" carrying the error. On these endpoints summit-api answers
 * 412 only for "already in that state" and for events with an internal RSVP.
 * (Event data only carries rsvp_type, so any RSVP counts here.)
 */
import * as Sentry from "@sentry/react";
import { addToSchedule, removeFromSchedule } from "../user-actions";
import { executeUserIntent, USER_INTENT } from "../user-intents";
import { alertWarning } from "../../utils/alerts";
import expiredToken from "../../utils/expiredToken";

jest.mock("@sentry/react", () => ({ captureException: jest.fn() }));
jest.mock("openstack-uicore-foundation/lib/utils/actions", () => ({
  createAction: (type) => (payload) => ({ type, payload }),
}));
jest.mock("../user-actions", () => ({
  addToSchedule: jest.fn(),
  removeFromSchedule: jest.fn(),
  ADD_TO_SCHEDULE: "ADD_TO_SCHEDULE",
  REMOVE_FROM_SCHEDULE: "REMOVE_FROM_SCHEDULE",
}));
jest.mock("../../utils/alerts", () => ({ alertWarning: jest.fn() }));
jest.mock("../../utils/expiredToken", () => jest.fn());

const event = { id: 42 };
const add = { type: USER_INTENT.AddToSchedule, event };
const remove = { type: USER_INTENT.RemoveFromSchedule, event };
const httpError = (status) => Object.assign(new Error(`HTTP ${status}`), { response: { status } });

let state;
const getState = () => state;
const dispatched = [];
const dispatch = jest.fn((action) => {
  if (typeof action === "function") return action(dispatch, getState);
  if (action && typeof action.then === "function") return action;
  dispatched.push(action);
  return action;
});
const savedSchedule = (...ids) => ({ userState: { userProfile: { schedule_summit_events: ids.map((id) => ({ id })) } } });
// the write thunks resolve or reject the way the real actions do
const writeResolves = (fn) => fn.mockImplementation((ev) => () => Promise.resolve(ev));
const writeRejects = (fn, err) => fn.mockImplementation(() => () => Promise.reject(err));

beforeEach(() => {
  jest.clearAllMocks();
  dispatched.length = 0;
  state = savedSchedule();
});

describe("executeUserIntent: add to schedule", () => {
  it("sends the write and resolves with the event", async () => {
    writeResolves(addToSchedule);
    await expect(executeUserIntent(add)(dispatch, getState)).resolves.toBe(event);
    expect(addToSchedule).toHaveBeenCalledWith(event);
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("on a 412, treats the event as already scheduled, without Sentry or a message", async () => {
    writeRejects(addToSchedule, httpError(412));

    await expect(executeUserIntent(add)(dispatch, getState)).resolves.toBe(event);

    expect(dispatched).toContainEqual({ type: "ADD_TO_SCHEDULE", payload: event });
    expect(Sentry.captureException).not.toHaveBeenCalled();
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("on a 412 for an event with an RSVP, rejects with the RSVP message", async () => {
    const error = httpError(412);
    writeRejects(addToSchedule, error);
    const rsvpEvent = { id: 43, rsvp_type: "Public" };

    await expect(executeUserIntent({ type: USER_INTENT.AddToSchedule, event: rsvpEvent })(dispatch, getState)).rejects.toBe(error);
    expect(alertWarning).toHaveBeenCalledWith("Could not update My Schedule", "This session requires an RSVP.");
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("rejects with a message and Sentry on any other failure", async () => {
    const error = httpError(500);
    writeRejects(addToSchedule, error);

    await expect(executeUserIntent(add)(dispatch, getState)).rejects.toBe(error);
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
    expect(alertWarning).toHaveBeenCalledTimes(1);
  });

  it("sends a 401 to the expired-session page, without a message", async () => {
    const error = httpError(401);
    writeRejects(addToSchedule, error);

    await expect(executeUserIntent(add)(dispatch, getState)).rejects.toBe(error);
    expect(expiredToken).toHaveBeenCalled();
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("stays quiet when there is no token (the user is already being logged out)", async () => {
    writeRejects(addToSchedule, undefined);

    await expect(executeUserIntent(add)(dispatch, getState)).rejects.toBeUndefined();
    expect(alertWarning).not.toHaveBeenCalled();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it("leaves the message to the caller when silent", async () => {
    writeRejects(addToSchedule, httpError(500));
    await expect(executeUserIntent(add, { silent: true })(dispatch, getState)).rejects.toBeTruthy();
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("sends repeated clicks one after another; the repeat's 412 settles it", async () => {
    const calls = [];
    let finishFirst;
    addToSchedule
      .mockImplementationOnce((ev) => () => { calls.push("first"); return new Promise((resolve) => { finishFirst = () => resolve(ev); }); })
      .mockImplementationOnce(() => () => { calls.push("second"); return Promise.reject(httpError(412)); });

    const first = executeUserIntent(add)(dispatch, getState);
    const second = executeUserIntent(add)(dispatch, getState);
    await Promise.resolve();
    await Promise.resolve();
    expect(calls).toEqual(["first"]);
    finishFirst();

    await expect(Promise.all([first, second])).resolves.toEqual([event, event]);
    expect(calls).toEqual(["first", "second"]);
    expect(alertWarning).not.toHaveBeenCalled();
  });

  it("runs a remove made during a pending add after the add, in that order", async () => {
    const calls = [];
    let finishAdd;
    addToSchedule.mockImplementation((ev) => () => { calls.push("add"); return new Promise((resolve) => { finishAdd = () => { state = savedSchedule(42); resolve(ev); }; }); });
    removeFromSchedule.mockImplementation((ev) => () => { calls.push("remove"); state = savedSchedule(); return Promise.resolve(ev); });

    const adding = executeUserIntent(add)(dispatch, getState);
    const removing = executeUserIntent(remove)(dispatch, getState);
    await Promise.resolve();
    await Promise.resolve();
    expect(calls).toEqual(["add"]);
    finishAdd();

    await expect(Promise.all([adding, removing])).resolves.toEqual([event, event]);
    expect(calls).toEqual(["add", "remove"]);
  });

  it("retries on a click made after a real failure", async () => {
    addToSchedule
      .mockImplementationOnce(() => () => Promise.reject(httpError(500)))
      .mockImplementationOnce((ev) => () => Promise.resolve(ev));

    await expect(executeUserIntent(add)(dispatch, getState)).rejects.toBeTruthy();
    await expect(executeUserIntent(add)(dispatch, getState)).resolves.toBe(event);
    expect(addToSchedule).toHaveBeenCalledTimes(2);
  });

  it("rejects an intent without an event id without sending anything", async () => {
    await expect(executeUserIntent({ type: USER_INTENT.AddToSchedule, event: {} })(dispatch, getState)).rejects.toThrow();
    expect(addToSchedule).not.toHaveBeenCalled();
  });
});

describe("executeUserIntent: remove from schedule", () => {
  beforeEach(() => {
    state = savedSchedule(42);
  });

  it("sends the write and resolves with the event", async () => {
    writeResolves(removeFromSchedule);
    await expect(executeUserIntent(remove)(dispatch, getState)).resolves.toBe(event);
    expect(removeFromSchedule).toHaveBeenCalledWith(event);
  });

  it("on a 412, treats the event as already removed", async () => {
    writeRejects(removeFromSchedule, httpError(412));

    await expect(executeUserIntent(remove)(dispatch, getState)).resolves.toBe(event);
    expect(dispatched).toContainEqual({ type: "REMOVE_FROM_SCHEDULE", payload: event });
  });

  it("on a 412 for an event with an RSVP, rejects", async () => {
    const error = httpError(412);
    writeRejects(removeFromSchedule, error);
    const rsvpEvent = { id: 42, rsvp_type: "Private" };

    await expect(executeUserIntent({ type: USER_INTENT.RemoveFromSchedule, event: rsvpEvent })(dispatch, getState)).rejects.toBe(error);
  });
});
