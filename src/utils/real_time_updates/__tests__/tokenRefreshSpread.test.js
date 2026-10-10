/**
 * A push reaches every open tab in the same second. A tab whose access token
 * is expired (or about to be) refreshes it on that push, so the IDP gets all
 * those refreshes at once. The helper makes such a tab wait a random 0-10 s
 * first; tabs with a usable token, and anonymous visitors, must not wait.
 */
import { getAccessToken, getAuthInfo } from "openstack-uicore-foundation/lib/security/methods";
import { getAccessTokenWithRefreshSpread } from "../tokenRefreshSpread";

jest.mock("openstack-uicore-foundation/lib/security/methods", () => ({
  getAccessToken: jest.fn(),
  getAuthInfo: jest.fn(),
  ACCESS_TOKEN_SKEW_TIME: 60,
}));

const NOW_SECS = 1800000000;
const EXPIRES_IN = 7200;

// uicore refreshes when elapsed >= expiresIn - ACCESS_TOKEN_SKEW_TIME (60).
const authInfoElapsed = (elapsedSecs, overrides = {}) => ({
  accessToken: "stored-token",
  expiresIn: EXPIRES_IN,
  accessTokenUpdatedAt: NOW_SECS - elapsedSecs,
  refreshToken: "refresh-token",
  ...overrides,
});

describe("getAccessTokenWithRefreshSpread", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW_SECS * 1000);
    getAccessToken.mockReset();
    getAuthInfo.mockReset();
    jest.spyOn(Math, "random").mockReturnValue(0.5);
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it.each([[0], [100], [EXPIRES_IN - 60 - 1]])(
    "does not delay a token that is still valid (elapsed %i s)",
    async (elapsed) => {
      getAuthInfo.mockReturnValue(authInfoElapsed(elapsed));
      getAccessToken.mockResolvedValue("token-1");

      const promise = getAccessTokenWithRefreshSpread();

      expect(getAccessToken).toHaveBeenCalledTimes(1);
      expect(jest.getTimerCount()).toBe(0);
      await expect(promise).resolves.toBe("token-1");
    }
  );

  it("does not delay an anonymous visitor and propagates the missing-auth error", async () => {
    getAuthInfo.mockReturnValue(null);
    getAccessToken.mockRejectedValue(new Error("AUTH_ERROR_MISSING_AUTH_INFO"));

    const promise = getAccessTokenWithRefreshSpread();

    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(jest.getTimerCount()).toBe(0);
    await expect(promise).rejects.toThrow("AUTH_ERROR_MISSING_AUTH_INFO");
  });

  describe.each([
    ["at the skew boundary", authInfoElapsed(EXPIRES_IN - 60)],
    ["past expiry", authInfoElapsed(EXPIRES_IN + 600)],
    ["with the access token cleared", authInfoElapsed(0, { accessToken: null })],
  ])("a token %s", (_label, authInfo) => {
    beforeEach(() => {
      getAuthInfo.mockReturnValue(authInfo);
      getAccessToken.mockResolvedValue("fresh-token");
    });

    it("waits the random delay before refreshing", async () => {
      const promise = getAccessTokenWithRefreshSpread();

      expect(getAccessToken).not.toHaveBeenCalled();
      jest.advanceTimersByTime(4999);
      expect(getAccessToken).not.toHaveBeenCalled();
      jest.advanceTimersByTime(1);

      await expect(promise).resolves.toBe("fresh-token");
      expect(getAccessToken).toHaveBeenCalledTimes(1);
    });
  });

  it("refreshes without waiting when the random draw is 0", async () => {
    Math.random.mockReturnValue(0);
    getAuthInfo.mockReturnValue(authInfoElapsed(EXPIRES_IN + 1));
    getAccessToken.mockResolvedValue("fresh-token");

    const promise = getAccessTokenWithRefreshSpread();
    jest.advanceTimersByTime(0);

    await expect(promise).resolves.toBe("fresh-token");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("never waits 10 s or more, even for the largest draw", async () => {
    Math.random.mockReturnValue(0.9999);
    getAuthInfo.mockReturnValue(authInfoElapsed(EXPIRES_IN + 1));
    getAccessToken.mockResolvedValue("fresh-token");

    const promise = getAccessTokenWithRefreshSpread();
    jest.advanceTimersByTime(9990);
    expect(getAccessToken).not.toHaveBeenCalled();
    jest.advanceTimersByTime(10);

    await expect(promise).resolves.toBe("fresh-token");
    expect(getAccessToken).toHaveBeenCalledTimes(1);
  });

  it("shares one delay and one refresh between calls made while it is pending, resolving in call order", async () => {
    getAuthInfo.mockReturnValue(authInfoElapsed(EXPIRES_IN + 1));
    getAccessToken.mockResolvedValue("fresh-token");
    const order = [];

    const calls = [1, 2, 3].map((n) =>
      getAccessTokenWithRefreshSpread().then((token) => {
        order.push(n);
        return token;
      })
    );

    expect(jest.getTimerCount()).toBe(1);
    jest.advanceTimersByTime(5000);
    const tokens = await Promise.all(calls);

    expect(getAccessToken).toHaveBeenCalledTimes(1);
    expect(tokens).toEqual(["fresh-token", "fresh-token", "fresh-token"]);
    expect(order).toEqual([1, 2, 3]);
  });

  it("gives every joined caller the same rejection, then re-evaluates on the next call", async () => {
    getAuthInfo.mockReturnValue(authInfoElapsed(EXPIRES_IN + 1));
    getAccessToken.mockRejectedValueOnce(new Error("refresh failed"));

    const settled = Promise.allSettled([
      getAccessTokenWithRefreshSpread(),
      getAccessTokenWithRefreshSpread(),
    ]);
    jest.advanceTimersByTime(5000);
    const results = await settled;

    expect(results.map((r) => r.status)).toEqual(["rejected", "rejected"]);
    expect(results[0].reason).toBe(results[1].reason);
    expect(getAccessToken).toHaveBeenCalledTimes(1);

    // the failed refresh left nothing pending: a later call starts over
    getAuthInfo.mockReturnValue(authInfoElapsed(0));
    getAccessToken.mockResolvedValue("token-2");
    const next = getAccessTokenWithRefreshSpread();

    expect(getAccessToken).toHaveBeenCalledTimes(2);
    await expect(next).resolves.toBe("token-2");
  });
});

describe("the uicore exports the helper relies on", () => {
  // The tests above mock uicore. If a new uicore version dropped one of these,
  // the delay would silently never apply, so check the real module.
  it("exist in the installed openstack-uicore-foundation", () => {
    const uicore = jest.requireActual("openstack-uicore-foundation/lib/security/methods");
    expect(typeof uicore.ACCESS_TOKEN_SKEW_TIME).toBe("number");
    expect(typeof uicore.getAuthInfo).toBe("function");
    expect(typeof uicore.getAccessToken).toBe("function");
  });
});
