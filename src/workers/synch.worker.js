import SynchStrategyFactory from "./sync_strategies/synch_strategy_factory";

// ---- Internal state (persisted across messages while draining) ----
let busy = false;
let localSummit = null;
let localAllEvents = null;
let localAllIDXEvents = null;
let localAllSpeakers = null;
let localAllIDXSpeakers = null;
let currentAccessToken = null;

// Dedup/backpressure pool: key -> { payload, seq }
const pool = new Map();
let seq = 0;

// Helper: coalescing precedence
function mergePayload(oldEntry, newPayload) {
    if (!oldEntry) return newPayload; // nothing to merge
    const oldOp = oldEntry.entity_operator;
    const newOp = newPayload.entity_operator;

    // DELETE always wins
    if (newOp === "DELETE") return newPayload;
    if (oldOp === "DELETE") return oldEntry;

    // Otherwise, last write wins (INSERT/UPDATE)
    return newPayload;
}

// Helper: parse value only if it's a string
function maybeParseJSON(val) {
    return typeof val === "string" ? JSON.parse(val) : val;
}

/* eslint-disable-next-line no-restricted-globals */
self.onmessage = (e) => {
    const {
        accessToken,
        noveltiesArray,
        summit,
        allEvents,
        allIDXEvents,
        allSpeakers,
        allIDXSpeakers,
    } = e.data || {};

    // Initialize persistent state once
    if (localSummit === null)      localSummit       = maybeParseJSON(summit);
    if (localAllEvents === null)   localAllEvents    = maybeParseJSON(allEvents);
    if (localAllIDXEvents === null)localAllIDXEvents = maybeParseJSON(allIDXEvents);
    if (localAllSpeakers === null) localAllSpeakers  = maybeParseJSON(allSpeakers);
    if (localAllIDXSpeakers === null) localAllIDXSpeakers = maybeParseJSON(allIDXSpeakers);

    currentAccessToken = accessToken ?? currentAccessToken;

    // Coalesce incoming payloads into the pool (backpressure)
    const items = maybeParseJSON(noveltiesArray) || [];
    for (const payload of items) {
        const key = `${payload.entity_type}|${payload.entity_id}`;
        const existing = pool.get(key)?.payload;
        const merged = mergePayload(existing, payload);
        // Assign new seq if it's a new key or we changed the payload
        if (!existing || merged !== existing) {
            pool.set(key, { payload: merged, seq: ++seq });
        }
    }

    if (!busy) void drain();
};

async function drain() {
    busy = true;
    try {
        // Keep draining while there is work (new messages can keep adding to pool)
        // We snapshot-and-clear each iteration to process a stable batch.
        while (pool.size) {
            const batch = Array.from(pool.values())
                .sort((a, b) => a.seq - b.seq) // stable arrival order
                .map((e) => e.payload);

            pool.clear();

            await runBatch(batch);
        }
        console.log("synch worker: pool empty");
    } catch (err) {
        console.log("synch worker fatal error", err);
    } finally {
        // Reset after everything in the pool is processed (or on fatal error)
        busy = false;
        localSummit = null;
        localAllEvents = null;
        localAllIDXEvents = null;
        localAllSpeakers = null;
        localAllIDXSpeakers = null;
        // keep currentAccessToken as-is; next message can refresh it
    }
}

async function runBatch(batch) {
    if (!batch || !batch.length) return;

    console.log(`synch worker running for ${localSummit?.id} ... batch size=${batch.length}`);

    let lastPayload = null;

    for (const payload of batch) {
        // Skip exact adjacent duplicates (cheap guard)
        if (
            lastPayload &&
            lastPayload.entity_type === payload.entity_type &&
            lastPayload.entity_operator === payload.entity_operator &&
            lastPayload.entity_id === payload.entity_id
        ) {
            console.log("synch worker: skip adjacent duplicate", payload);
            continue;
        }

        console.log("synch worker: building strategy for", payload);
        const s = SynchStrategyFactory.build(
            localSummit,
            localAllEvents,
            localAllIDXEvents,
            localAllSpeakers,
            localAllIDXSpeakers,
            currentAccessToken,
            payload
        );
        lastPayload = payload;

        if (!s) {
            console.log("synch worker: missing strategy, skipping", payload);
            continue;
        }

        try {
            const res = await s.process(payload);
            const {
                summit:        resSummit,
                eventsData:    resAllEvents,
                allIDXEvents:  resAllIDXEvents,
                allSpeakers:   resAllSpeakers,
                allIDXSpeakers:resAllIDXSpeakers,
            } = res || {};

            // Carry state forward
            if (resSummit)        localSummit = resSummit;
            if (resAllEvents)     localAllEvents = resAllEvents;
            if (resAllIDXEvents)  localAllIDXEvents = resAllIDXEvents;
            if (resAllSpeakers)   localAllSpeakers = resAllSpeakers;
            if (resAllIDXSpeakers)localAllIDXSpeakers = resAllIDXSpeakers;

            /* eslint-disable-next-line no-restricted-globals */
            self.postMessage(res);
        } catch (err) {
            console.log("synch worker payload error", payload, err);
            // keep going with next payload
        }
    }
}