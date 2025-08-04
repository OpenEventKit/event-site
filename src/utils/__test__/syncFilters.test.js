import { syncFilters } from '../schedule';

describe('syncFilters', () => {

    const originalNewFilters = {
        track: { label: 'Track', order: 1, values: ['A'], options: ['A'] },
        level: { label: 'Level', order: 2, values: ['Beginner'], options: ['Beginner'] }
    };

    const currentFilters = {
        track: { values: ['Dev'], options: ['Dev', 'Ops'] },
        level: { values: ['Intermediate'], options: ['Beginner', 'Advanced'] }
    };

    it('should return new filters with values/options copied from current filters', () => {
        const newFilters = JSON.parse(JSON.stringify(originalNewFilters)); // deep clone

        const result = syncFilters(newFilters, currentFilters);

        expect(result.track.values).toEqual(['Dev']);
        expect(result.track.options).toEqual(['Dev', 'Ops']);
        expect(result.level.values).toEqual(['Intermediate']);
        expect(result.level.options).toEqual(['Beginner', 'Advanced']);
    });

    it('should not mutate original newFilters object', () => {
        const newFilters = JSON.parse(JSON.stringify(originalNewFilters)); // deep clone

        syncFilters(newFilters, currentFilters);

        expect(newFilters.track.values).toEqual(['A']);
        expect(newFilters.track.options).toEqual(['A']);
        expect(newFilters.level.values).toEqual(['Beginner']);
        expect(newFilters.level.options).toEqual(['Beginner']);
    });

    it('should produce a result that does not share references with currentFilters', () => {
        const newFilters = JSON.parse(JSON.stringify(originalNewFilters));

        const result = syncFilters(newFilters, currentFilters);

        expect(result.track.values).not.toBe(currentFilters.track.values);
        expect(result.track.options).not.toBe(currentFilters.track.options);
    });

});