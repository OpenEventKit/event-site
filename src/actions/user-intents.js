import * as Sentry from "@sentry/react";
import { createAction } from "openstack-uicore-foundation/lib/utils/actions";
import {
    addToSchedule,
    removeFromSchedule,
    ADD_TO_SCHEDULE,
    REMOVE_FROM_SCHEDULE,
} from "./user-actions";
import { alertWarning } from "../utils/alerts";
import expiredToken from "../utils/expiredToken";

/**
 * A user intent is a write the user asked for, captured as data, so every
 * surface (the schedule widgets and the post-login replay) runs it through the
 * same path: one write per event at a time, in click order, and a 412 settled
 * instead of failing silently.
 */
export const USER_INTENT = {
    AddToSchedule: "ADD_TO_SCHEDULE",
    RemoveFromSchedule: "REMOVE_FROM_SCHEDULE",
};

const INTENTS = {
    [USER_INTENT.AddToSchedule]: { write: addToSchedule, settled: ADD_TO_SCHEDULE },
    [USER_INTENT.RemoveFromSchedule]: { write: removeFromSchedule, settled: REMOVE_FROM_SCHEDULE },
};

const FAILED_TITLE = "Could not update My Schedule";
const FAILED_MESSAGE = "We could not update My Schedule. Please try again.";
const RSVP_MESSAGE = "This session requires an RSVP.";

// One write per event at a time, in click order. A repeated click sends its
// write after the previous one, and its 412 settles it as done.
const queues = new Map();

// summit-api answers 412 to adding or removing an event with an internal RSVP
// (SummitEvent::hasRSVP() && !isExternalRSVP()): its schedule belongs to the
// RSVP. Event data only carries rsvp_type, so an external RSVP counts as
// internal here; that errs on the side of an error message.
const hasRSVP = (event) => !!event.rsvp_type && event.rsvp_type !== "None";

const run = async (dispatch, intent, { silent }) => {
    const { event } = intent;
    const { write, settled } = INTENTS[intent.type];

    try {
        return await dispatch(write(event));
    } catch (e) {
        // No token: loginUtils already logged the user out.
        if (e === undefined) return Promise.reject(e);

        const status = e?.response?.status;
        if (status === 401) {
            expiredToken(e);
            return Promise.reject(e);
        }

        // summit-api answers 412 on these endpoints when the event is already in
        // (or already out of) the schedule, which happens when the saved profile
        // is stale, and when the event has an internal RSVP. Anything else that
        // stops the write (unknown or unpublished event) is a 404.
        if (status === 412 && !hasRSVP(event)) {
            dispatch(createAction(settled)(event));
            return event;
        }
        if (status !== 412) Sentry.captureException(e);

        if (!silent) alertWarning(FAILED_TITLE, status === 412 ? RSVP_MESSAGE : FAILED_MESSAGE);
        return Promise.reject(e);
    }
};

/**
 * Runs a user intent and resolves with the event once the server holds it, or
 * rejects. `silent` leaves the failure message to the caller.
 */
export const executeUserIntent = (intent, { silent = false } = {}) => (dispatch) => {
    const eventId = intent?.event?.id;
    if (!INTENTS[intent?.type] || !eventId) {
        return Promise.reject(new Error("Invalid user intent"));
    }

    const previous = queues.get(eventId) ?? Promise.resolve();
    const promise = previous.catch(() => {}).then(() => run(dispatch, intent, { silent }));
    queues.set(eventId, promise);
    const release = () => {
        if (queues.get(eventId) === promise) queues.delete(eventId);
    };
    promise.then(release, release);
    return promise;
};
