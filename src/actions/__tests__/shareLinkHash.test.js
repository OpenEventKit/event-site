import {
    updateCustomEventIdsFromHash,
    updateFiltersFromHash,
    getShareLink,
    SET_CUSTOM_EVENT_IDS,
} from '../schedule-actions';

const setHash = (hash) => {
    window.location.hash = hash;
};

// customEventIds deliberately doesn't match any value computed below, so the
// "unchanged" short-circuit in updateCustomEventIdsFromHash never suppresses dispatch here
const getState = () => ({
    allSchedulesState: { schedules: [{ key: 'schedKey', customEventIds: [999] }] }
});

afterEach(() => {
    setHash('');
});

describe('updateCustomEventIdsFromHash', () => {
    it('parses a numeric event_ids list from the hash', () => {
        setHash('#event_ids=1,2,3');
        const dispatch = jest.fn();

        updateCustomEventIdsFromHash('schedKey')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith({
            type: SET_CUSTOM_EVENT_IDS,
            payload: { customEventIds: [1, 2, 3], key: 'schedKey' },
        });
    });

    it('drops unknown/non-numeric ids without throwing', () => {
        setHash('#event_ids=1,abc,3');
        const dispatch = jest.fn();

        expect(() => updateCustomEventIdsFromHash('schedKey')(dispatch, getState)).not.toThrow();
        expect(dispatch).toHaveBeenCalledWith({
            type: SET_CUSTOM_EVENT_IDS,
            payload: { customEventIds: [1, 3], key: 'schedKey' },
        });
    });

    it('dispatches an empty list when event_ids is absent from the hash', () => {
        setHash('#track=5');
        const dispatch = jest.fn();

        updateCustomEventIdsFromHash('schedKey')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith({
            type: SET_CUSTOM_EVENT_IDS,
            payload: { customEventIds: [], key: 'schedKey' },
        });
    });

    it('is not affected by the whole-fragment lowercasing of the hash param key', () => {
        setHash('#EVENT_IDS=1,2');
        const dispatch = jest.fn();

        updateCustomEventIdsFromHash('schedKey')(dispatch, getState);

        expect(dispatch).toHaveBeenCalledWith({
            type: SET_CUSTOM_EVENT_IDS,
            payload: { customEventIds: [1, 2], key: 'schedKey' },
        });
    });
});

describe('updateFiltersFromHash - event_ids isolation (mitigation for verified points 7 & 8)', () => {
    it('never includes event_ids as a key of the dispatched filters object', () => {
        setHash('#event_ids=10,20&track=5');
        const dispatch = jest.fn();
        const filters = {
            track: { label: 'Track', values: [], options: ['5', '6'] },
        };

        updateFiltersFromHash('schedKey', filters, null)(dispatch);

        expect(dispatch).toHaveBeenCalled();
        const dispatchedFilters = dispatch.mock.calls[0][0].payload.filters;
        expect(Object.keys(dispatchedFilters)).not.toContain('event_ids');
    });
});

describe('getShareLink - event_ids passthrough (regression, verified point 5)', () => {
    it('keeps event_ids in the link when an active filter exists', () => {
        setHash('#event_ids=10,20&track=5');
        const filters = { track: { values: ['5'], options: ['5', '6'] } };

        const link = getShareLink(filters, null);

        expect(link).toContain('event_ids=10,20');
    });

    it('keeps event_ids in the link when all filters are empty', () => {
        setHash('#event_ids=10,20');
        const filters = { track: { values: [], options: ['5', '6'] } };

        const link = getShareLink(filters, null);

        expect(link).toContain('event_ids=10,20');
    });

    it('keeps event_ids in the link when view is null and no filters are passed', () => {
        setHash('#event_ids=10,20');

        const link = getShareLink(null, null);

        expect(link).toContain('event_ids=10,20');
    });
});
