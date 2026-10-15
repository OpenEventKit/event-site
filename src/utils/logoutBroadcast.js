const CHANNEL_NAME = "event-site-auth";
const LOGOUT_MESSAGE = "logout";

let channel;

// one channel per tab, so a tab never receives its own broadcast; null where BroadcastChannel is unsupported (Safari < 15.4)
const getChannel = () => {
  if (channel !== undefined) return channel;
  try {
    channel = typeof window !== "undefined" && "BroadcastChannel" in window
      ? new window.BroadcastChannel(CHANNEL_NAME)
      : null;
  } catch (e) {
    console.warn("logoutBroadcast::getChannel", e);
    channel = null;
  }
  return channel;
};

export const broadcastLogout = () => {
  try {
    getChannel()?.postMessage(LOGOUT_MESSAGE);
  } catch (e) {
    console.warn("logoutBroadcast::broadcastLogout", e);
  }
};

export const onLogoutBroadcast = (callback) => {
  const ch = getChannel();
  if (!ch) return;
  ch.addEventListener("message", ({ data }) => {
    if (data === LOGOUT_MESSAGE) callback();
  });
};

// test only
export const resetLogoutChannel = () => {
  channel = undefined;
};
