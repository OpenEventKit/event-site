/**
 * Wraps an async function so that runs never overlap, callers arriving
 * mid-run collapse onto one queued follow-up, and every caller's answer
 * comes from a run started no earlier than their call.
 *
 * Built for API requests: uicore aborts a second request to the same URL,
 * and an aborted request never settles, so overlap strands callers. The
 * freshness guarantee means a caller who knows the data just changed (a
 * completed purchase) can never be handed a response requested before it.
 *
 * A rejected run rejects for its callers but does not wedge the queue.
 */
export const collapsingQueue = (run) => {
  let chain = null; // settles when the last scheduled run settles
  let scheduled = null; // scheduled but not yet started, if any

  return (...args) => {
    if (scheduled) return scheduled;

    const link = chain
      ? chain.then(() => {
          scheduled = null;
          return run(...args);
        })
      : run(...args);
    if (chain) scheduled = link;

    const settled = link
      .catch(() => {})
      .finally(() => {
        if (chain === settled) chain = null;
      });
    chain = settled;
    return link;
  };
};
