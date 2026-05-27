const axios = require("axios");
const {
  BUILD_REQUEST_MAX_RETRIES,
  BUILD_REQUEST_RETRY_BASE_BACKOFF_MS
} = require("./constants");

const RETRIABLE_STATUSES = new Set([502, 503, 504]);

const isRetriable = (error) => {
  if (!error?.response) return true;
  return RETRIABLE_STATUSES.has(error.response.status);
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getWithRetry = async (
  url,
  options = {},
  retriesLeft = BUILD_REQUEST_MAX_RETRIES,
  backoffMs = BUILD_REQUEST_RETRY_BASE_BACKOFF_MS
) => {
  try {
    return await axios.get(url, options);
  } catch (error) {
    if (retriesLeft <= 0 || !isRetriable(error)) throw error;
    console.log(`getWithRetry: ${error?.response?.status || error?.code || error?.message} on ${url}, retrying in ${backoffMs}ms (${retriesLeft} left)`);
    await delay(backoffMs);
    return getWithRetry(url, options, retriesLeft - 1, backoffMs * 2);
  }
};

module.exports = getWithRetry;
