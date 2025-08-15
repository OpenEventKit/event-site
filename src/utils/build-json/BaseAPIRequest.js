class BaseAPIRequest {
    constructor(fields = [], relations = [], expands = []) {        
        this.fields = fields;
        this.relations = relations;
        this.expands = expands;
    }
    
    getFields() {
        return this.fields.join(",");
    }

    getExpands() {
        return this.expands.join(",");
    }

    getRelations() {
        return this.relations.join(",");
    }
    
    static build(apiUrl) {        
        throw new Error("This method should not be used from BaseAPIRequest class.");
    }
}

module.exports = BaseAPIRequest;
