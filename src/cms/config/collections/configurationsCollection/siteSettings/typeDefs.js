
module.exports = `
  type SiteMetadata {
    title: String
    description: String
  }
  type Favicons {
    favicon180: File @fileByRelativePath
    favicon32: File @fileByRelativePath
    favicon16: File @fileByRelativePath
  }
  type Schedule {
    allowClick: Boolean
  }
  type Chat {
    enabled: Boolean
    showQA: Boolean
    showHelp: Boolean
    defaultScope: String
  }
  type Widgets {
    schedule: Schedule
    chat: Chat
  }
  type SiteSettingsJson implements Node {
    siteMetadata: SiteMetadata
    favicons: Favicons
    widgets: Widgets
  }
`;
