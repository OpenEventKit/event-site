import { START_LOADING, STOP_LOADING } from "openstack-uicore-foundation/lib/utils/actions";
import { LOGOUT_USER } from "openstack-uicore-foundation/lib/security/actions";
import {GET_EVENT_DATA, GET_EVENT_DATA_ERROR, RELOAD_EVENT_STATE, SET_EVENT_LAST_UPDATE, GET_EVENT_STREAMING_INFO} from "../actions/event-actions-definitions";
import {RESET_STATE, SYNC_DATA} from "../actions/base-actions-definitions";

const DEFAULT_STATE = {
  loading: false,
  event: null,
  lastUpdate: null,
  tokens:null,
};

const eventReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action

  switch (type) {

    case RESET_STATE:
    case LOGOUT_USER:
    {
      return DEFAULT_STATE;
    }
    case SET_EVENT_LAST_UPDATE:{
      return {...state, lastUpdate: payload};
    }
    case START_LOADING:
      return { ...state, loading: true };
    case STOP_LOADING:
      return { ...state, loading: false };
    case GET_EVENT_DATA: {
      const event = payload?.response ?? payload.event;
      // check if we need to update the current event or do we need to just use the new one
      const updatedEvent = event.id  === state?.event?.id ? {...state, ...event} : event;
      return { ...state, loading: false, event: updatedEvent, tokens: null };
    }
    case SYNC_DATA:{
      // update current event if we have one on data sync
      const {eventsData, eventsIDXData } = payload;
      if(state?.event){
        const idx = eventsIDXData[state?.event?.id] || null;
        if(idx) {
          const updatedEvent = eventsData[idx];
          return {...state, loading: false, event: updatedEvent, tokens: null};
        }
      }
      return state;
    }
    case GET_EVENT_DATA_ERROR: {
      return { ...state, loading: false, event: null, tokens: null }
    }
    // reload event state
    case RELOAD_EVENT_STATE:{
      const { tokens: newTokens, ...rest } = payload;
      const formerTokens = state.tokens;
      return {...state, loading:false, event: {...rest}, tokens: newTokens || formerTokens};
    }
    case GET_EVENT_STREAMING_INFO:{
      const { tokens, ...rest } = payload.response
      return {...state, tokens: tokens, event: { ...state.event, ...rest}};
    }
    default:
      return state;
  }
};

export default eventReducer;
