import { refreshUserProfile } from "../user-actions";

// How calls collapse and queue is collapsingQueue's contract, covered by its
// own tests; these cover only what the thunk itself decides.
const buildGetState = ({ isLoggedUser = 1, loading = false } = {}) => () => ({
  loggedUserState: { isLoggedUser },
  userState: { loading },
});

describe("refreshUserProfile", () => {
  it("dispatches the profile fetch for a logged-in user", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    await refreshUserProfile()(dispatch, buildGetState());
    expect(dispatch).toHaveBeenCalledTimes(1);
    expect(dispatch).toHaveBeenCalledWith(expect.any(Function));
  });

  it("does not fetch while logged out", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    await refreshUserProfile()(dispatch, buildGetState({ isLoggedUser: 0 }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("fetches even when the persisted state claims a fetch is in flight", async () => {
    // userState.loading is persisted, so a fetch interrupted by a reload
    // leaves it true in localStorage. Trusting it here meant never fetching
    // again on exactly the surfaces that exist to refresh the profile.
    const dispatch = jest.fn(() => Promise.resolve());
    await refreshUserProfile()(dispatch, buildGetState({ loading: true }));
    expect(dispatch).toHaveBeenCalledTimes(1);
  });

  it("swallows fetch failures instead of rejecting", async () => {
    const dispatch = jest.fn(() => Promise.reject(new Error("network")));
    await expect(refreshUserProfile()(dispatch, buildGetState())).resolves.toBeUndefined();
  });
});
