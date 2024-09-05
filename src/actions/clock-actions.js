import { createAction } from "openstack-uicore-foundation/lib/utils/actions";
import { PHASES, getSummitPhase, getEventPhase } from "@utils/phasesUtils";
import { updateVotingPeriodsPhase } from "../actions/presentation-actions";
import { sanitizeHash } from "../actions/security-actions";

export const SUMMIT_PHASE_AFTER = "SUMMIT_PHASE_AFTER";
export const SUMMIT_PHASE_DURING = "SUMMIT_PHASE_DURING";
export const SUMMIT_PHASE_BEFORE = "SUMMIT_PHASE_BEFORE";
export const EVENT_PHASE_BEFORE = "EVENT_PHASE_BEFORE";
export const EVENT_PHASE_DURING = "EVENT_PHASE_DURING";
export const EVENT_PHASE_AFTER = "EVENT_PHASE_AFTER";
export const EVENT_PHASE_ADD = "EVENT_PHASE_ADD";
export const UPDATE_CLOCK = "UPDATE_CLOCK";

export const updateClock = (timestamp) => (dispatch) => {
  dispatch(createAction(UPDATE_CLOCK)({ timestamp }));

  dispatch(updateSummitPhase());
  dispatch(updateEventsPhase());
  dispatch(updateVotingPeriodsPhase());

  dispatch(sanitizeHash());
};

export const updateSummitPhase = () => (dispatch, getState) => {

  const { clockState: { nowUtc, summit_phase }, summitState: {summit} } = getState();

  if (nowUtc) {
    const summitPhase = getSummitPhase(summit, nowUtc, summit_phase);
    if (summit_phase !== summitPhase) {
      switch (summitPhase) {
        case PHASES.BEFORE:
          dispatch(createAction(SUMMIT_PHASE_BEFORE)(PHASES.BEFORE));
          break;
        case PHASES.DURING:
          dispatch(createAction(SUMMIT_PHASE_DURING)(PHASES.DURING));
          break;
        case PHASES.AFTER:
          dispatch(createAction(SUMMIT_PHASE_AFTER)(PHASES.AFTER));
          break;
        default:
          break;
      }
    }
  }
};

export const updateEventsPhase = () => (dispatch, getState) => {

  // get current activity and check phase
  const { eventState: { event }, clockState: { nowUtc, events_phases } } = getState();

  if (event?.id) {
    const newEvent = {
      id: event.id,
      start_date: event.start_date,
      end_date: event.end_date,
      phase: null
    };

    // if phase for the event is not calculated then create a new empty
    if (!events_phases.some(event => event.id === newEvent.id)) {
      dispatch(createAction(EVENT_PHASE_ADD)(newEvent));
    }
  }

  // on the previous calculated ones , recalculate the advance
  events_phases.forEach(event => {
    const newPhase = getEventPhase(event, nowUtc);
    // if has change the phase
    if (event.phase !== newPhase) {
      switch (newPhase) {
        case PHASES.BEFORE: {
          const updatedEvent = { ...event, phase: PHASES.BEFORE };
          dispatch(createAction(EVENT_PHASE_BEFORE)(updatedEvent));
          break;
        }
        case PHASES.DURING: {
          const updatedEvent = { ...event, phase: PHASES.DURING };
          dispatch(createAction(EVENT_PHASE_DURING)(updatedEvent));
          break;
        }
        case PHASES.AFTER: {
          const updatedEvent = { ...event, phase: PHASES.AFTER };
          dispatch(createAction(EVENT_PHASE_AFTER)(updatedEvent));
          break;
        }
        default:
          break;
      }
    }
  });
};
