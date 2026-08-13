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
