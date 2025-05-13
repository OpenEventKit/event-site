const BaseAPIRequest = require("./BaseAPIRequest");
const { SPEAKER_MODERATOR_FIELDS, CURRENT_ATTENDANCE_FIELDS, DOCUMENTS_FIELDS } = require("./constants");

class EventAPIRequest extends BaseAPIRequest {
    constructor() {
        const event_primary_fields = [
            "id",
            "created",
            "start_date",
            "end_date",
            "title",
            "abstract",
            "description",
            "level",
            "image",
            "stream_thumbnail",
            "location_id",
            "class_name",
            "allow_feedback",
            "head_count",
            "attendance_count",
            "current_attendance_count",
            "to_record",
            "etherpad_link",
            "streaming_url",
            "streaming_type",
            "meeting_url",
            "current_attendance",
            "attendees_expected_learnt",
            "show_sponsors",
            "duration",
        ];

        const events_type_fields = ["type.id", "type.name", "type.allows_publishing_dates", "type.color"];
        const events_tags_fields = ["tags.id", "tags.tag"];
        const events_location_fields = ["location.id", "location.class_name", "location.name", "location.venue.name", "location.venue.floor", "location.floor.name"];
        const events_track_fields = ["track.id", "track.name", "track.icon_url", "track.color", "track.text_color", "track.parent_id"];
        const events_track_groups_fields = ["track_groups.id", "track_groups.name", "track_groups.parent_id", "track_groups.color", "track_groups.order"];
        const events_speakers_badge_feature_fields = ["speakers.badge_features.id", "speakers.badge_features.name", "speakers.badge_features.image"];
        const events_sponsors_fields = ["sponsors.id", "sponsors.name", "sponsors.logo"];

        const event_fields_from_constants = `
            speakers.${SPEAKER_MODERATOR_FIELDS.join(",speakers.")},
            current_attendance.${CURRENT_ATTENDANCE_FIELDS.join(',current_attendance.')},
            moderator.${SPEAKER_MODERATOR_FIELDS.join(",moderator.")},
            media_uploads.${DOCUMENTS_FIELDS.join(",media_uploads.")},
            videos.${DOCUMENTS_FIELDS.join(",videos.")},
            slides.${DOCUMENTS_FIELDS.join(",slides.")},
            links.${DOCUMENTS_FIELDS.join(",links.")}
        `;

        const event_relations = ["speakers.badge_features", "speakers.all_presentations", "speakers.all_moderated_presentations", "track.track_groups"];

        const event_expands = ["slides", "links", "videos", "media_uploads", "type", "track", "location", "location.venue", "location.floor", "speakers", "speakers.badge_features", "moderator", "sponsors", "tags", "track.subtracks", "track.allowed_access_levels", "current_attendance"];

        super(
            [
                ...event_primary_fields,
                ...events_type_fields,
                ...events_tags_fields,
                ...events_location_fields,
                ...events_track_fields,
                ...events_track_groups_fields,
                ...events_sponsors_fields,
                ...event_fields_from_constants.trim().split(","),
                ...events_speakers_badge_feature_fields
            ],
            event_relations,
            event_expands
        );

        EventAPIRequest.instance = this;
    }

    static getInstance() {
        if (!EventAPIRequest.instance) {
            new EventAPIRequest();
        }
        return EventAPIRequest.instance;
    }    

    static build(apiUrl) {
        const instance = EventAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = EventAPIRequest;
