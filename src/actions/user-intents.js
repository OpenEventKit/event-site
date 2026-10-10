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
 * same path: skip it when the saved profile already shows it done, share one
 * request between repeated clicks, and settle a 412 instead of failing
 * silently.
 */
export const USER_INTENT = {
    AddToSchedule: "ADD_TO_SCHEDULE",
    RemoveFromSchedule: "REMOVE_FROM_SCHEDULE",
};

const INTENTS = {
    [USER_INTENT.AddToSchedule]: { write: addToSchedule, settled: ADD_TO_SCHEDULE, wantOnSchedule: true },
    [USER_INTENT.RemoveFromSchedule]: { write: removeFromSchedule, settled: REMOVE_FROM_SCHEDULE, wantOnSchedule: false },
};

const FAILED_TITLE = "Could not update My Schedule";
const FAILED_MESSAGE = "We could not update My Schedule. Please try again.";

// Runs in flight, keyed by event: a second click on the same event (add or
// remove) waits for the first instead of sending another write.
const inFlight = new Map();

const isOnSavedSchedule = (getState, eventId) =>
    !!getState().userState.userProfile?.schedule_summit_events?.some(ev => ev?.id === eventId);

// Same rule as summit-api's SummitEvent::hasRSVP() && !isExternalRSVP(): the
// schedule of such an event belongs to its RSVP, so adding or removing it
// directly always answers 412.
const hasInternalRSVP = (event) =>
    !!event.rsvp_type && event.rsvp_type !== "None" && !(event.rsvp_link && !event.rsvp_template_id);

const run = async (dispatch, getState, intent, { silent }) => {
    const { event } = intent;
    const { write, settled, wantOnSchedule } = INTENTS[intent.type];

    // The saved profile already holds it (mostly the post-login replay, which
    // runs right after a fresh profile load): nothing to send.
    if (getState().userState.userProfile && isOnSavedSchedule(getState, event.id) === wantOnSchedule) {
        return event;
    }

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
        if (status === 412) {
            if (!hasInternalRSVP(event)) {
                dispatch(createAction(settled)(event));
                return event;
            }
        } else {
            Sentry.captureException(e);
        }

        if (!silent) alertWarning(FAILED_TITLE, FAILED_MESSAGE);
        return Promise.reject(e);
    }
};

/**
 * Runs a user intent and resolves with the event once the server holds it, or
 * rejects. `silent` leaves the failure message to the caller.
 */
export const executeUserIntent = (intent, { silent = false } = {}) => (dispatch, getState) => {
    const eventId = intent?.event?.id;
    if (!INTENTS[intent?.type] || !eventId) {
        return Promise.reject(new Error("Invalid user intent"));
    }

    const pending = inFlight.get(eventId);
    if (pending) return pending;

    const promise = run(dispatch, getState, intent, { silent }).finally(() => {
        inFlight.delete(eventId);
    });
    inFlight.set(eventId, promise);
    return promise;
};
