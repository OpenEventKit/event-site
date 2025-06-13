const BaseAPIRequest = require("./BaseAPIRequest");
class SpeakersAPIRequest extends BaseAPIRequest {
    static instance;

    constructor() {

        const primary_fields =
            ['id', 'first_name', 'last_name', 'title', 'bio', 'member_id', 'pic', 'big_pic', 'company'];

        const relations = ["none"];

        const expands = []

        super(
            [
                ...primary_fields
            ],
            relations,
            expands
        );

        if (!SpeakersAPIRequest.instance) {
            SpeakersAPIRequest.instance = this;
        }
    }

    static getInstance() {
        if (!SpeakersAPIRequest.instance) {
            new SpeakersAPIRequest();
        }
        return SpeakersAPIRequest.instance;
    }

    static getParams(apiUrl) {
        const instance = SpeakersAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());
        return apiUrl.query(true);
    }

    static build(apiUrl) {
        const instance = SpeakersAPIRequest.getInstance();
        apiUrl.addQuery("fields", instance.getFields());
        apiUrl.addQuery("expand", instance.getExpands());
        apiUrl.addQuery("relations", instance.getRelations());

        return apiUrl.toString();
    }
}

module.exports = SpeakersAPIRequest;
