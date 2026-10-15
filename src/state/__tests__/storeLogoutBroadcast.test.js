/**
 * When another tab logs out, this tab must drop its logged in state, or
 * redux-persist writes it back to storage without an authInfo.
 */
import { onLogoutBroadcast } from "../../utils/logoutBroadcast";
import { store } from "../store";

// a reducer dependency runs a graphql query at module load
jest.mock("gatsby", () => ({
  graphql: jest.fn(),
  navigate: jest.fn(),
  useStaticQuery: jest.fn(),
  withPrefix: (path) => path,
}));
jest.mock("../../utils/logoutBroadcast", () => ({
  onLogoutBroadcast: jest.fn(),
}));

describe("store logout broadcast", () => {
  const onOtherTabLogout = () => onLogoutBroadcast.mock.calls[0][0]();

  it("listens for logouts from other tabs", () => {
    expect(onLogoutBroadcast).toHaveBeenCalledTimes(1);
  });

  it("logs out a logged in tab", () => {
    store.dispatch({ type: "SET_LOGGED_USER", payload: { sessionState: null } });
    expect(store.getState().loggedUserState.isLoggedUser).toBe(true);

    onOtherTabLogout();

    expect(store.getState().loggedUserState.isLoggedUser).toBe(false);
  });

  it("does nothing on a tab that is already logged out", () => {
    const dispatch = jest.spyOn(store, "dispatch");

    onOtherTabLogout();

    expect(dispatch).not.toHaveBeenCalled();
    dispatch.mockRestore();
  });
});
