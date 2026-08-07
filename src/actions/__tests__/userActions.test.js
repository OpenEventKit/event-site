import { refreshUserProfile } from "../user-actions";

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

  it("does not fetch while a profile fetch is already in flight", async () => {
    const dispatch = jest.fn(() => Promise.resolve());
    await refreshUserProfile()(dispatch, buildGetState({ loading: true }));
    expect(dispatch).not.toHaveBeenCalled();
  });

  it("swallows fetch failures instead of rejecting", async () => {
    const dispatch = jest.fn(() => Promise.reject(new Error("network")));
    await expect(refreshUserProfile()(dispatch, buildGetState())).resolves.toBeUndefined();
  });
});
