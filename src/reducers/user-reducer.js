import { reduceReducers } from '../utils/reducer-utils';
import { LOGOUT_USER } from 'openstack-uicore-foundation/lib/security/actions';
import {

    GET_DISQUS_SSO,
    GET_USER_PROFILE,
    START_LOADING_PROFILE,
    STOP_LOADING_PROFILE,
    GET_IDP_PROFILE,
    SET_USER_TICKET,
    START_LOADING_IDP_PROFILE,
    STOP_LOADING_IDP_PROFILE,
    ADD_TO_SCHEDULE,
    REMOVE_FROM_SCHEDULE,
    SCHEDULE_SYNC_LINK_RECEIVED,
    SET_USER_ORDER,
    CAST_PRESENTATION_VOTE_RESPONSE,
    UNCAST_PRESENTATION_VOTE_RESPONSE,
    TOGGLE_PRESENTATION_VOTE,
    TICKET_OWNER_CHANGED,
    RECEIVE_INVITATION,
    REQUEST_INVITATION,
    REJECT_INVITATION,
    RSVP_CONFIRMED,
    RSVP_CANCELLED,
    REQUEST_RSVP_INVITATION,
    RECEIVE_RSVP_INVITATION,
    RSVP_INVITATION_ERROR,
    RSVP_INVITATION_ACCEPTED,
    RSVP_INVITATION_REJECTED

} from '../actions/user-actions';
import { RESET_STATE } from '../actions/base-actions-definitions';
import { isAuthorizedUser } from '../utils/authorizedGroups';

const DEFAULT_STATE = {
  loading: false,
  loadingIDP: false,
  disqusSSO: null,
  userProfile: null,
  idpProfile: null,
  isAuthorized: false,
  hasTicket: false,
  attendee: null,
  invitation: null,
  rsvpInvitation: null,
}

const userReducer = (state = DEFAULT_STATE, action) => {
  const { type, payload } = action;
  switch (type) {
    case RESET_STATE:
    case LOGOUT_USER: {
      return DEFAULT_STATE;
    }
    case START_LOADING_PROFILE:
      return { ...state, loading: true };
    case STOP_LOADING_PROFILE:
      return { ...state, loading: false };
    case START_LOADING_IDP_PROFILE:
      return { ...state, loadingIDP: true };
    case STOP_LOADING_IDP_PROFILE:
      return { ...state, loadingIDP: false };
    case GET_USER_PROFILE:
      const { response: userProfile } = payload;
      return {
        ...state,
        userProfile: userProfile,
        isAuthorized: isAuthorizedUser(userProfile.groups),
        hasTicket: userProfile.summit_tickets?.length > 0
      }
    // is this action type used?
    case SET_USER_TICKET:
      return { ...state, hasTicket: payload }
    case SET_USER_ORDER: {
      // we need to verify that the ticket is for current attendee
      const currentUserTickets = (payload?.tickets || []).filter(t => t?.owner?.email == state.userProfile?.email);
      return {
        ...state,
        hasTicket: (state.hasTicket || currentUserTickets.length > 0),
        userProfile: {
          ...state.userProfile,
          summit_tickets: [...(state.userProfile?.summit_tickets || []), ...(currentUserTickets)]
        }
      };
    }
    case GET_IDP_PROFILE:
      return { ...state, idpProfile: payload.response }
    case ADD_TO_SCHEDULE: {
      return { ...state, userProfile: { ...state.userProfile, schedule_summit_events: [...state.userProfile.schedule_summit_events, payload] } }
    }
    case REMOVE_FROM_SCHEDULE: {
      return { ...state, userProfile: { ...state.userProfile, schedule_summit_events: [...state.userProfile.schedule_summit_events.filter(ev => ev.id !== payload.id)] } }
    }
      case RSVP_CONFIRMED: {
          return { ...state, userProfile: { ...state.userProfile, rsvp: [...state.userProfile.rsvp, {...payload} ] } }
      }
      case RSVP_CANCELLED: {
          return { ...state, userProfile: {
              ...state.userProfile,
              rsvp: [...state?.userProfile?.rsvp?.filter(r => r.event_id !== payload.id)],
              rsvp_invitations:state?.userProfile?.rsvp_invitations?.filter(i => i.event_id !== payload.id),
          } }
      }
    case GET_DISQUS_SSO:
      const disqus = payload.response;
      return { ...state, loading: false, disqusSSO: disqus };
    case SCHEDULE_SYNC_LINK_RECEIVED:
      const { link } = payload.response;
      return { ...state, userProfile: { ...state.userProfile, schedule_shareable_link: link } };
    case TICKET_OWNER_CHANGED: {
      const ticketUpdated = payload.response;
      const isUserTicket = state.userProfile?.summit_tickets.some(t => t.id === ticketUpdated.id);
      let currentUserTickets = [...state.userProfile?.summit_tickets];
      // if is an user ticket and is reassigned or unassiged, remove it from current user tickets
      if (isUserTicket) {
        if (ticketUpdated?.owner_id === 0 || ticketUpdated?.owner?.member_id !== state.userProfile.id) {
          currentUserTickets = [...currentUserTickets].filter(t => t.id !== ticketUpdated.id)
        }
      }
      // if the new ticket belongs to the current user, add it to current user tickets
      if (ticketUpdated?.owner?.member_id === state.userProfile.id) {
        currentUserTickets = [...currentUserTickets, ticketUpdated];
      }
      return {
        ...state,
        hasTicket: currentUserTickets.length > 0,
        userProfile: {
          ...state.userProfile,
          summit_tickets: [...(currentUserTickets)]
        }
      };
    }
    case REQUEST_INVITATION: {
      return { ...state, invitation: null };
    }
    case RECEIVE_INVITATION: {
      return { ...state, invitation: payload.response }
    }
    case REJECT_INVITATION: {
      return { ...state, invitation: { ...state.invitation, status: 'Rejected' } }
    }
    case REQUEST_RSVP_INVITATION: {
      return { ...state, rsvpInvitation: null }
    }
    case RECEIVE_RSVP_INVITATION: {
      let invitation = payload.response;
      invitation.event_id = invitation.event.id;
      return { ...state, rsvpInvitation: invitation }
    }
    case RSVP_INVITATION_ERROR: {
      const { errorMessage } = payload;
      return { ...state, rsvpInvitation: { errorMessage } }
    }
    case RSVP_INVITATION_ACCEPTED: {
      const invitation = payload.response;
      const userProfile = state.userProfile? {
          ...state?.userProfile,
          rsvp_invitations:[ ...state?.userProfile?.rsvp_invitations,{
            event_id: invitation.event_id,
            status: invitation.status,
          }],
          rsvp: [...state?.userProfile?.rsvp, {...invitation.rsvp}],
          schedule_summit_events: [...state?.userProfile?.schedule_summit_events, {id: invitation.event_id}]
      } : null;

      return { ...state,
          rsvpInvitation: invitation,
          // update invitations and rsvps
          userProfile: userProfile,
      }
    }
    case RSVP_INVITATION_REJECTED: {
        // update invitations
        const invitation = payload.response;
        const userProfile = state.userProfile ? {...state?.userProfile,
            rsvp_invitations:[ ...state?.userProfile?.rsvp_invitations,{
                event_id: invitation.event_id,
                status: invitation.status
            }],
            schedule_summit_events: [...state.userProfile.schedule_summit_events.filter(ev => ev.id !== invitation.event_id)]
        }: null;
        return { ...state,
          rsvpInvitation: invitation,
          userProfile: userProfile,
      }
    }
    default:
      return state;
  }
};

const attendeeReducer = (state, action) => {
  const { type, payload } = action;
  switch (type) {
    case GET_USER_PROFILE:
      const { summit_tickets: [ticket] } = payload.response;
      return { ...state, attendee: ticket?.owner ?? null };
    case SET_USER_ORDER: {
      const [ticket] = payload?.tickets || [];
      return { ...state, attendee: ticket?.owner ?? null };
    }
    case CAST_PRESENTATION_VOTE_RESPONSE: {
      const { attendee } = state;
      if (!attendee) return state;
      const { presentation_votes } = attendee;
      const { response: vote } = payload;
      // remove 'local vote' vote before adding real vote
      const filteredVotes = presentation_votes.filter(v => v.presentation_id !== vote.presentation_id);
      return { ...state, attendee: { ...state.attendee, presentation_votes: [...filteredVotes, vote] } };
    }
    case UNCAST_PRESENTATION_VOTE_RESPONSE: {
      const { attendee } = state;
      if (!attendee) return state;
      const { presentation_votes } = attendee;
      const { presentation } = payload;
      const newVotes = [...presentation_votes.filter(v => v.presentation_id !== presentation.id)];
      return { ...state, attendee: { ...state.attendee, presentation_votes: newVotes } };
    }
    case TOGGLE_PRESENTATION_VOTE: {
      const { attendee } = state;
      if (!attendee) return state;
      const { presentation_votes } = attendee;
      const { presentation, isVoted } = payload;
      let newVotes;
      if (isVoted) {
        const localVote = { presentation_id: presentation.id };
        newVotes = [...presentation_votes, localVote];
      } else {
        newVotes = [...presentation_votes.filter(v => v.presentation_id !== presentation.id)];
      }
      return { ...state, attendee: { ...state.attendee, presentation_votes: newVotes } };
    }
    default:
      return state;
  }
};

export default reduceReducers(userReducer, attendeeReducer);
