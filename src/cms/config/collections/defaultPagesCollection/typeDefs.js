const marketingPageTypeDefs = require("./marketingPage/typeDefs");
const lobbyPageTypeDefs = require("./lobbyPage/typeDefs");
const expoHallPageTypeDefs = require("./expoHallPage/typeDefs");
const invitationsRejectPageTypeDefs = require("./invitationsRejectPage/typeDefs");
const mySchedulePageTypeDefs = require("./mySchedulePage/typeDefs");
const badgeQrPageTypeDefs = require("./badgeQrPage/typeDefs")

module.exports = [
  marketingPageTypeDefs,
  lobbyPageTypeDefs,
  expoHallPageTypeDefs,
  invitationsRejectPageTypeDefs,
  mySchedulePageTypeDefs,
  badgeQrPageTypeDefs
].join("");
