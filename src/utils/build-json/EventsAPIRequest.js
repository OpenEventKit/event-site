const BaseAPIRequest = require("./BaseAPIRequest");

const SPEAKER_MODERATOR_FIELDS = ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company', 'featured'];
const DOCUMENTS_FIELDS = ['display_on_site', 'name', 'order', 'class_name', 'type', 'public_url', 'link'];
const CURRENT_ATTENDANCE_FIELDS = ['member_first_name', 'member_last_name', 'member_pic'];

class EventAPIRequest extends BaseAPIRequest {
    static instance;

    constructor() {
        const primary_fields = [
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
            // RSVP fields
            'rsvp_type',
            'rsvp_capacity',
        ];

        const type_fields = ["type.id", "type.name", "type.allows_publishing_dates", "type.color"];
        const tags_fields = ["tags.id", "tags.tag"];
        const location_fields = ["location.id", "location.class_name", "location.name", "location.venue.name", "location.floor.name"];
        const track_fields = ["track.id", "track.name", "track.icon_url", "track.color", "track.text_color", "track.parent_id"];
        const track_groups_fields = ["track_groups.id", "track_groups.name", "track_groups.parent_id", "track_groups.color", "track_groups.order"];
        const speakers_badge_feature_fields = ["speakers.badge_features.id", "speakers.badge_features.name", "speakers.badge_features.image"];
        const sponsors_fields = ["sponsors.id", "sponsors.name", "sponsors.logo"];

        const speakers_fields = SPEAKER_MODERATOR_FIELDS.map((e) => `speakers.${e}`);
        const moderator_fields = SPEAKER_MODERATOR_FIELDS.map((e) => `moderator.${e}`);
        const media_upload_fields = DOCUMENTS_FIELDS.map((e) => `media_uploads.${e}`)
        const slides_fields = DOCUMENTS_FIELDS.map((e) => `slides.${e}`)
        const links_fields = DOCUMENTS_FIELDS.map((e) => `links.${e}`)
        const video_fields = DOCUMENTS_FIELDS.map((e) => `videos.${e}`)
        const current_attendance_fields = CURRENT_ATTENDANCE_FIELDS.map((e) => `current_attendance.${e}`)

        const primary_relations = [
            "slides",
            "links",
            "videos",
            "media_uploads",
            "type",
            "track",
            "location",
            "speakers",
            "moderator",
            "sponsors",
            "tags",
            "current_attendance",
            "allowed_ticket_types"
        ];

        const speakers_relations = ["speakers.badge_features", "speakers.presentations", "speakers.moderated_presentations"];

        const track_relations = ["track.track_groups"];

        const type_relations = ["type.allowed_ticket_types"];

        const locations_relations = ["location.venue", "location.floor", "location.venue.none", "location.floor.none"];

        // TODO: review relations for "current_attendance"

        const relations = [
            ...track_relations,
            ...type_relations,
            ...speakers_relations,
            ...locations_relations,
            ...primary_relations,
        ];

        const speakers_expand = ["speakers.badge_features"];

        const location_expand = ["location.venue", "location.floor"];

        const track_expand = [
            "track.subtracks",
            "track.allowed_access_levels",
        ]

        const expands = [
            "slides",
            "links",
            "videos",
            "media_uploads",
            "type",
            "track",
            "location",
            "speakers",
            "moderator",
            "sponsors",
            "tags",
            "current_attendance",
            ...track_expand,
            ...speakers_expand,
            ...location_expand
        ];

        super(
            [
                ...primary_fields,
                ...type_fields,
                ...tags_fields,
                ...location_fields,
                ...track_fields,
                ...track_groups_fields,
                ...sponsors_fields,
                ...speakers_fields,
                ...moderator_fields,
                ...media_upload_fields,
                ...slides_fields,
                ...links_fields,
                ...video_fields,
                ...current_attendance_fields,
                ...speakers_badge_feature_fields
            ],
            relations,
            expands
        );

        if (!EventAPIRequest.instance) {
            EventAPIRequest.instance = this;
        }
    }

    static getInstance() {
        if (!EventAPIRequest.instance) {
            new EventAPIRequest();
        }
        return EventAPIRequest.instance;
    }

    static getParams(apiUrl) {
        const instance = EventAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());
        return apiUrl.query(true);
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
