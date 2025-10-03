const BaseAPIRequest = require("./BaseAPIRequest");

class SummitAPIRequest extends BaseAPIRequest {
    static instance;


    constructor() {
        /*
         *  WARNING
         *  if any of these fields , relations or expand changes should be replicated here
         *  https://github.com/fntechgit/pub-api/blob/main/api/utils/summit_api_requests/summit_api_request.py
         */
        const primary_fields = [
            "id", "name", "start_date", "end_date", "time_zone_id", "time_zone_label", "secondary_logo", "slug",
            "support_email", "start_showing_venues_date", "dates_with_events", "logo", "dates_label",
            "registration_allowed_refund_request_till_date", "allow_update_attendee_extra_questions", "is_virtual",
            "registration_disclaimer_mandatory", "registration_disclaimer_content", "reassign_ticket_till_date",
            "is_main", "title", "description", "time_zone"
        ];

        const event_types_fields = [
            "event_types.id"
        ];

        const tracks_fields = [
            "tracks.id", "tracks.name", "tracks.code", "tracks.order", "tracks.parent_id", "tracks.color","tracks.text_color",
            "tracks.subtracks.id", "tracks.subtracks.name", "tracks.subtracks.code", "tracks.subtracks.order",
            "tracks.subtracks.parent_id", "tracks.subtracks.color","tracks.subtracks.text_color",
        ];

        const ticket_types_fields = [
            "ticket_types.id", "ticket_types.name", "ticket_types.created", "ticket_types.cost"
        ];

        const track_groups_fields = [
            "track_groups.id", "track_groups.name", "track_groups.color"
        ];

        const location_fields = [
            "locations.id", "locations.class_name", "locations.is_main", "locations.name", "locations.city",
            "locations.country", "locations.venue.name"
        ];

        const ticket_types_relations = ["ticket_types.none"];
        const tracks_relations = ["tracks", "tracks.subtracks.none"];
        const track_groups_relations = ["track_groups.none"];
        const location_relations = ["locations.none", "locations.venue.none"];
        const event_types_relations = ["event_types.none"];

        const relations = [
            "dates_with_events",
            "locations",
            "payment_profiles",
            "time_zone",
            ...ticket_types_relations,
            ...tracks_relations,
            ...track_groups_relations,
            ...location_relations,
            ...event_types_relations
        ];

        const schedule_settings_expands = [
            "schedule_settings.filters",
            "schedule_settings.pre_filters"
        ];

        const track_expands = ["tracks.subtracks"];

        const locations_expands = ["locations.venue"];

        const expands = [
            "event_types",
            "badge_features_types",
            "tracks",
            "track_groups",
            "presentation_levels",
            "locations",
            "schedule_settings",
            "ticket_types",
            ...schedule_settings_expands,
            ...track_expands,
            ...locations_expands
        ];

        super(
            [
                ...primary_fields,
                ...event_types_fields,
                ...tracks_fields,
                ...ticket_types_fields,
                ...track_groups_fields,
                ...location_fields,
            ],
            relations,
            expands
        );

        if (!SummitAPIRequest.instance) {
            SummitAPIRequest.instance = this;
        }
    }

    static getInstance() {
        if (!SummitAPIRequest.instance) {
            new SummitAPIRequest();
        }
        return SummitAPIRequest.instance;
    }

    static build = (apiUrl) => {
        const instance = SummitAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = SummitAPIRequest;
