const siteSettingsTypeDefs = require("./siteSettings/typeDefs");
const adsTypeDefs = require("./ads/typeDefs");
const navbarTypeDefs = require("./navbar/typeDefs");
const footerTypeDefs = require("./footer/typeDefs");
const paymentsTypeDefs = require("./payments/typeDefs");

module.exports = [
  siteSettingsTypeDefs,
  adsTypeDefs,
  navbarTypeDefs,
  footerTypeDefs,
  paymentsTypeDefs
].join("");
