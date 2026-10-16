import { storeAuthInfo } from "openstack-uicore-foundation/lib/security/methods";
import { dropTransientUserFlags, deriveLoggedInFromAuthInfo } from "../persistTransforms";

describe("dropTransientUserFlags", () => {
  it("clears the in-flight flags on rehydrate", () => {
    // A fetch interrupted by a reload persists loading: true. Rehydrated
    // as-is it describes a request that no longer exists: the widget shows
    // a profile-loading state and anything gating on it waits forever.
    const persisted = {
      loading: true,
      loadingIDP: true,
      userProfile: { summit_tickets: [{ id: 1 }] },
      hasTicket: true,
    };

    const rehydrated = dropTransientUserFlags.out(persisted, "userState", {});

    expect(rehydrated.loading).toBe(false);
    expect(rehydrated.loadingIDP).toBe(false);
    // Only the flags: the profile snapshot itself is the point of persisting.
    expect(rehydrated.userProfile).toEqual(persisted.userProfile);
    expect(rehydrated.hasTicket).toBe(true);
  });
});

describe("deriveLoggedInFromAuthInfo", () => {
  // another tab may have persisted the opposite of what the shared token says
  afterEach(() => window.localStorage.clear());

  it("rehydrates as logged in when authInfo is present", () => {
    storeAuthInfo("access-token", 3600);

    const rehydrated = deriveLoggedInFromAuthInfo.out({ isLoggedUser: false, backUrl: "/a/" }, "loggedUserState", {});

    expect(rehydrated.isLoggedUser).toBe(true);
    expect(rehydrated.backUrl).toBe("/a/");
  });

  it("rehydrates as logged out when authInfo is missing", () => {
    const rehydrated = deriveLoggedInFromAuthInfo.out({ isLoggedUser: true }, "loggedUserState", {});

    expect(rehydrated.isLoggedUser).toBe(false);
  });
});
