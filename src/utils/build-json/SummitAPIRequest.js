class SummitAPIRequest {
    static instance;

    constructor() {
        if (SummitAPIRequest.instance) {
            return SummitAPIRequest.instance;
        }

        const primary_fields = [
            "id", "name", "start_date", "end_date", "time_zone_id", "time_zone_label", "secondary_logo", "slug",
            "payment_profiles", "support_email", "start_showing_venues_date", "dates_with_events", "logo",
            "registration_allowed_refund_request_till_date", "allow_update_attendee_extra_questions", "is_virtual",
            "registration_disclaimer_mandatory", "registration_disclaimer_content", "reassign_ticket_till_date",
            "is_main", "title", "description", "time_zone"
        ];

        const tracks_fields = [
            "tracks.id", "tracks.name", "tracks.code", "tracks.order", "tracks.parent_id", "tracks.color",
            "tracks.subtracks.id", "tracks.subtracks.name", "tracks.subtracks.code", "tracks.subtracks.order",
            "tracks.subtracks.parent_id", "tracks.subtracks.color"
        ];

        const ticket_types_fields = [
            "ticket_types.id", "ticket_types.name", "ticket_types.created", "ticket_types.cost"
        ];

        const track_groups_fields = [
            "track_groups.id", "track_groups.name", "track_groups.tracks", "track_groups.color"
        ];

        const other_fields = [

        ];

        const relations = [
            "dates_with_events", "ticket_types.none", "tracks.subtracks.none", "track_groups.none", "locations",
            "locations.none", "payment_profiles", "time_zone", "none"
        ];

        const expands = [
            "event_types", "badge_features_types", "tracks", "tracks.subtracks", "track_groups", "presentation_levels",
            "locations", "locations.rooms", "locations.floors", "order_extra_questions.values", "schedule_settings",
            "schedule_settings.filters", "schedule_settings.pre_filters", "ticket_types"
        ];

        this.fields = [
            ...primary_fields,
            ...tracks_fields,
            ...ticket_types_fields,
            ...track_groups_fields,
            ...other_fields
        ];

        this.expands = [...expands];
        this.relations = [...relations];

        SummitAPIRequest.instance = this;
    }

    static getInstance() {
        if (!SummitAPIRequest.instance) {
            SummitAPIRequest.instance = new SummitAPIRequest();
        }
        return SummitAPIRequest.instance;
    }

    getFields = () => {
        const instance = SummitAPIRequest.getInstance();
        return instance.fields.join(",");
    }

    getExpands = () => {
        const instance = SummitAPIRequest.getInstance();
        return instance.expands.join(",");
    }

    getRelations = () => {
        const instance = SummitAPIRequest.getInstance();
        return instance.relations.join(",");
    }

    static build = (apiUrl) => {
        const instance = SummitAPIRequest.getInstance();
        apiUrl.addQuery('fields', instance.getFields());
        apiUrl.addQuery('expand', instance.getExpands());
        apiUrl.addQuery('relations', instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = SummitAPIRequest;
