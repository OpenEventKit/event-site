class SummitAPIRequest {
    static instance;

    constructor() {
        if (SummitAPIRequest.instance) {
            return SummitAPIRequest.instance;
        }

        this.fields = [];
        this.expands = [];
        this.relations = [];

        SummitAPIRequest.instance = this;
    }

    static getInstance() {
        if (!SummitAPIRequest.instance) {
            SummitAPIRequest.instance = new SummitAPIRequest();
        }
        return SummitAPIRequest.instance;
    }

    addFields = (fields) => {
        const instance = SummitAPIRequest.getInstance();
        instance.fields = [...instance.fields, ...fields];
    }

    addExpands = (expands) => {
        const instance = SummitAPIRequest.getInstance();
        instance.expands = [...instance.expands, ...expands];
    }

    addRelations = (relations) => {
        const instance = SummitAPIRequest.getInstance();
        instance.relations = [...instance.relations, ...relations];
    }

    buildQueryParams = () => {
        const instance = SummitAPIRequest.getInstance();
        return {
            fields: instance.fields.join(","),
            expand: instance.expands.join(","),
            relations: instance.relations.join(",")
        };
    }
}

module.exports = SummitAPIRequest;
