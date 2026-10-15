/**
 * A logout in one tab must reach the other open tabs, and browsers without
 * BroadcastChannel (Safari < 15.4) must keep working without it.
 */
describe("logoutBroadcast", () => {
  let logoutBroadcast;
  let channels;

  class FakeBroadcastChannel {
    constructor(name) {
      this.name = name;
      this.listeners = [];
      this.postMessage = jest.fn();
      channels.push(this);
    }

    addEventListener(type, listener) {
      if (type === "message") this.listeners.push(listener);
    }

    emit(data) {
      this.listeners.forEach((listener) => listener({ data }));
    }
  }

  beforeEach(() => {
    channels = [];
    jest.spyOn(console, "warn").mockImplementation(() => {});
    logoutBroadcast = require("../logoutBroadcast");
    logoutBroadcast.resetLogoutChannel();
  });

  afterEach(() => {
    delete window.BroadcastChannel;
    jest.restoreAllMocks();
  });

  describe("with BroadcastChannel", () => {
    beforeEach(() => {
      window.BroadcastChannel = FakeBroadcastChannel;
    });

    it("posts a logout message", () => {
      logoutBroadcast.broadcastLogout();

      expect(channels).toHaveLength(1);
      expect(channels[0].postMessage).toHaveBeenCalledWith("logout");
    });

    it("calls the callback on a logout message only", () => {
      const callback = jest.fn();
      logoutBroadcast.onLogoutBroadcast(callback);

      channels[0].emit("something else");
      expect(callback).not.toHaveBeenCalled();

      channels[0].emit("logout");
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it("sends and listens on the same channel, so a tab ignores its own logout", () => {
      logoutBroadcast.onLogoutBroadcast(jest.fn());
      logoutBroadcast.broadcastLogout();

      expect(channels).toHaveLength(1);
    });
  });

  describe("without BroadcastChannel", () => {
    it("does nothing and does not throw", () => {
      const callback = jest.fn();

      expect(() => logoutBroadcast.broadcastLogout()).not.toThrow();
      expect(() => logoutBroadcast.onLogoutBroadcast(callback)).not.toThrow();
      expect(callback).not.toHaveBeenCalled();
    });

    it("does not throw when the constructor fails", () => {
      window.BroadcastChannel = jest.fn(() => {
        throw new Error("SecurityError");
      });

      expect(() => logoutBroadcast.broadcastLogout()).not.toThrow();
      expect(() => logoutBroadcast.onLogoutBroadcast(jest.fn())).not.toThrow();
    });
  });
});
