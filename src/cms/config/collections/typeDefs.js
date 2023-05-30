const configurationsCollectionTypeDefs = require("./configurationsCollection/typeDefs");
const defaultPagesCollectionTypeDefs = require("./defaultPagesCollection/typeDefs");
const contentPagesCollectionTypeDefs = require("./contentPagesCollection/typeDefs");

module.exports = [
  configurationsCollectionTypeDefs,
  defaultPagesCollectionTypeDefs,
  contentPagesCollectionTypeDefs
].join("");
