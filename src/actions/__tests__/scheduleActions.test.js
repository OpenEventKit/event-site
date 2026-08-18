import {
    updateFiltersFromHash,
    updateCustomEventIdsFromHash,
} from '../schedule-actions';

const setHash = (hash) => {
    window.location.hash = hash;
};

afterEach(() => {
    setHash('');
});

it('keeps hash-applied facet filters across the follow-up pass', async () => {
    window.location.hash = '#event_ids=1,2&track=5';
    const dispatch1 = jest.fn();
    const filters = { track: { label: 'Track', values: [], options: ['5', '6'] } };

    await updateFiltersFromHash('schedKey', filters, null)(dispatch1);

    // pass 1 applies the filter and rewrites the hash keeping event_ids
    expect(dispatch1.mock.calls[0][0].payload.filters.track.values).toEqual([5]);
    expect(window.location.hash).toBe('#event_ids=1,2');

    // the hash change re-runs the [key, location.hash] effect (pass 2),
    // now with the state filters holding the applied values
    const dispatch2 = jest.fn();
    const filtersAfterPass1 = { track: { label: 'Track', values: [5], options: ['5', '6'] } };

    await updateFiltersFromHash('schedKey', filtersAfterPass1, null)(dispatch2);

    // desired: no filter params left in the hash -> keep state untouched
    expect(dispatch2).not.toHaveBeenCalled();
});

it('does not dispatch when the hash has no event_ids and state already holds none', () => {
    window.location.hash = '#track=5';
    const dispatch = jest.fn();
    const getState = () => ({
        allSchedulesState: { schedules: [{ key: 'schedKey', customEventIds: [] }] }
    });

    updateCustomEventIdsFromHash('schedKey')(dispatch, getState);

    expect(dispatch).not.toHaveBeenCalled();
});
