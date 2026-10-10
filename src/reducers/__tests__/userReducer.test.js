import userReducer from "../user-reducer";
import { GET_USER_PROFILE } from "../../actions/user-actions";

const staleStateWithTicket = {
  userProfile: {
    summit_tickets: [{ id: 1, owner: { id: 10, ticket_types: [{ id: 188 }] } }],
  },
  hasTicket: true,
  attendee: { id: 10, ticket_types: [{ id: 188 }] },
};

const profilePayload = (summit_tickets) => ({
  payload: { response: { groups: [], summit_tickets } },
  type: GET_USER_PROFILE,
});

describe("userReducer GET_USER_PROFILE", () => {
  it("clears ticket ownership when a fresh profile has no tickets", () => {
    // A refunded/deactivated ticket is excluded from the fresh payload; the
    // stale persisted ownership must not survive the refetch.
    const next = userReducer(staleStateWithTicket, profilePayload([]));
    expect(next.hasTicket).toBe(false);
    expect(next.userProfile.summit_tickets).toEqual([]);
    expect(next.attendee).toBeNull();
  });

  it("sets ticket ownership from a fresh profile with tickets", () => {
    const ticket = { id: 2, owner: { id: 20, ticket_types: [{ id: 189 }] } };
    const next = userReducer(staleStateWithTicket, profilePayload([ticket]));
    expect(next.hasTicket).toBe(true);
    expect(next.attendee).toEqual(ticket.owner);
  });
});

describe("userReducer GET_USER_PROFILE schedule_shareable_link", () => {
  const link = "https://summit.example/api/public/v1/summits/1/members/me/schedule/abc/ics";
  const profileWithLink = (schedule_shareable_link) => ({
    payload: { response: { groups: [], summit_tickets: [], schedule_shareable_link } },
    type: GET_USER_PROFILE,
  });

  it("flattens the serialized PersonalCalendarShareInfo to its link", () => {
    // /members/me returns the relation as an object; the schedule widget only
    // builds the Calendar Sync link from a string.
    const shareInfo = { id: 5, link, summit_id: 1, owner_id: 10, cid: "abc" };
    const next = userReducer({ userProfile: null }, profileWithLink(shareInfo));
    expect(next.userProfile.schedule_shareable_link).toBe(link);
  });

  it("keeps the link already in state when the refetch carries none", () => {
    const state = { userProfile: { schedule_shareable_link: link } };
    const next = userReducer(state, profileWithLink(undefined));
    expect(next.userProfile.schedule_shareable_link).toBe(link);
  });
});
