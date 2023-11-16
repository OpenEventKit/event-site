
module.exports = `
  type SiteMetadata {
    title: String
    description: String
  }
  type Favicon {
    asset: File @fileByRelativePath
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
    favicon: Favicon
    widgets: Widgets
  }
`;
