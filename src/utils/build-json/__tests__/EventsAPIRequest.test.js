const URI = require("urijs");
const EventAPIRequest = require("../EventsAPIRequest");

/**
 * summit-api honours the `fields` parameter strictly per expansion level, so
 * any field missing from EventAPIRequest silently vanishes from every event
 * payload (build-time fetch and runtime Ably sync alike). These guards cover
 * fields the schedule filter reads at runtime.
 */
describe("EventAPIRequest requested fields", () => {
    const requestedFields = () => {
        const url = URI("https://summit-api.test/api/public/v1/summits/1/events/published");
        const query = URI(EventAPIRequest.build(url)).query(true);
        return query.fields.split(",");
    };

    it("requests type.show_always_on_schedule so the schedule bypass can read it", () => {
        expect(requestedFields()).toContain("type.show_always_on_schedule");
    });
});
