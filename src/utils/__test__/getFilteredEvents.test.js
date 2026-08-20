import { getFilteredEvents } from '../schedule';

const TIMEZONE = 'America/New_York';

const makeEvent = (id, overrides = {}) => ({
    id,
    start_date: 1700000000,
    end_date: 1700003600,
    type: { show_always_on_schedule: false },
    track: { id: 1, track_groups: [] },
    speakers: [],
    tags: [],
    location: null,
    title: `Event ${id}`,
    description: `Description ${id}`,
    ...overrides,
});

describe('getFilteredEvents - customEventIds (custom schedule subset)', () => {
    const events = [makeEvent(1), makeEvent(2), makeEvent(3)];

    it('returns only the events whose id is in the custom subset', () => {
        const result = getFilteredEvents(events, {}, TIMEZONE, false, [1, 3]);
        expect(result.map(e => e.id)).toEqual([1, 3]);
    });

    it('returns an empty list when no id in the subset matches any event', () => {
        const result = getFilteredEvents(events, {}, TIMEZONE, false, [999]);
        expect(result).toEqual([]);
    });

    it('returns all events when customEventIds is omitted (optional argument)', () => {
        const result = getFilteredEvents(events, {}, TIMEZONE, false);
        expect(result.map(e => e.id)).toEqual([1, 2, 3]);
    });

    it('ignores filters.event_ids entirely - only the explicit argument is honored', () => {
        // characterisation of pre-existing behaviour: getFilteredEvents never read filters.event_ids,
        // and it must keep not reading it now that a real event_ids mechanism exists.
        const result = getFilteredEvents(events, { event_ids: { values: [1] } }, TIMEZONE, false);
        expect(result.map(e => e.id)).toEqual([1, 2, 3]);
    });

    it('composes with a regular facet filter, narrowing within the subset', () => {
        const eventsWithTracks = [
            makeEvent(1, { track: { id: 5, track_groups: [] } }),
            makeEvent(2, { track: { id: 6, track_groups: [] } }),
            makeEvent(3, { track: { id: 5, track_groups: [] } }),
        ];
        const filters = { track: { values: ['5'] } };
        const result = getFilteredEvents(eventsWithTracks, filters, TIMEZONE, false, [1, 2]);
        expect(result.map(e => e.id)).toEqual([1]);
    });

    it('still restricts events with show_always_on_schedule to the subset', () => {
        const eventsAlwaysOn = [
            makeEvent(1, { type: { show_always_on_schedule: true } }),
            makeEvent(2, { type: { show_always_on_schedule: true } }),
        ];
        const result = getFilteredEvents(eventsAlwaysOn, {}, TIMEZONE, false, [1]);
        expect(result.map(e => e.id)).toEqual([1]);
    });
});
