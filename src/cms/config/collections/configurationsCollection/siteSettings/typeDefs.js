
module.exports = `
  type Favicons {
    favicon180: File @fileByRelativePath
    favicon32: File @fileByRelativePath
    favicon16: File @fileByRelativePath
  }
  type Schedule {
    allowClick: Boolean
  }
  type Chat {
    showQA: Boolean
    showHelp: Boolean
    defaultScope: String
  }
  type Widgets {
    schedule: Schedule
    chat: Chat
  }
  type SiteSettingsJson implements Node {
    favicons: Favicons
    widgets: Widgets
  }
`;
