import createCache from "@emotion/cache";

let cacheInstance;

const createEmotionCache = (options) => {
  if (!cacheInstance) {
    cacheInstance = createCache(options ?? { key: "css" });
  }
  return cacheInstance;
};

export default createEmotionCache;
