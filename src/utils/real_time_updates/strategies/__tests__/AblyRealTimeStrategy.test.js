/**
 * Ably v2 subscribe() returns the attach promise and detach() takes no callback.
 * When Ably is unreachable the attach rejects, and it must not reach Sentry as an
 * unhandled rejection; close() must always close the client, or every page
 * navigation leaves an Ably connection open.
 */
import * as Ably from "ably";
import AblyRealTimeStrategy from "../AblyRealTimeStrategy";

jest.mock("ably", () => ({
  Realtime: jest.fn(),
}));

jest.mock("../../../envVariables", () => ({
  ABLY_API_KEY: "ABLY_API_KEY",
  getEnvVariable: () => "ABLY_KEY",
}));

const SUMMIT_ID = 1;

const buildClient = (channel) => ({
  connection: { state: "connected", on: jest.fn(), off: jest.fn() },
  channels: { get: jest.fn(() => channel), release: jest.fn() },
  close: jest.fn(),
});

const buildChannel = (overrides = {}) => ({
  name: `${SUMMIT_ID}:*:*`,
  state: "attached",
  subscribe: jest.fn(() => Promise.resolve()),
  unsubscribe: jest.fn(),
  off: jest.fn(),
  detach: jest.fn(() => Promise.resolve()),
  ...overrides,
});

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("AblyRealTimeStrategy", () => {
  let client;
  let channel;

  const createStrategy = () => {
    Ably.Realtime.mockImplementation(() => client);
    const strategy = new AblyRealTimeStrategy(jest.fn(), jest.fn());
    strategy.create(SUMMIT_ID);
    return strategy;
  };

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does not leave an unhandled rejection when subscribe fails", async () => {
    const onUnhandled = jest.fn();
    process.on("unhandledRejection", onUnhandled);
    channel = buildChannel({
      subscribe: jest.fn(() =>
        Promise.reject(new Error("Channel attach timed out"))
      ),
    });
    client = buildClient(channel);

    createStrategy();
    await flushPromises();

    process.off("unhandledRejection", onUnhandled);
    expect(onUnhandled).not.toHaveBeenCalled();
    expect(console.warn).toHaveBeenCalledWith(
      "AblyRealTimeStrategy::create channel.subscribe",
      expect.any(Error)
    );
  });

  it("closes the client after detaching an attached channel", async () => {
    channel = buildChannel();
    client = buildClient(channel);

    createStrategy().close();
    await flushPromises();

    expect(channel.detach).toHaveBeenCalledWith();
    expect(client.close).toHaveBeenCalledTimes(1);
  });

  it("closes the client when detach rejects", async () => {
    channel = buildChannel({
      detach: jest.fn(() =>
        Promise.reject(new Error("Channel detach timed out"))
      ),
    });
    client = buildClient(channel);

    createStrategy().close();
    await flushPromises();

    expect(client.close).toHaveBeenCalledTimes(1);
  });
});
