
module.exports = `
  type SiteMetadata {
    title: String
    description: String
    image: File @fileByRelativePath
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
  type IdpLogo {
    idpLogoDark: File @fileByRelativePath
    idpLogoLight: File @fileByRelativePath
    idpLogoAlt: String
  }
  type IdentityProviderButton {
    buttonColor: String
    buttonBorderColor: String
    providerLabel: String
    providerParam: String
    providerLogo: File @fileByRelativePath
    providerLogoSize: Float
  }
  type MaintenanceMode {
    enabled: Boolean
    title: String
    subtitle: String
  }
  type SiteSettingsJson implements Node {
    siteMetadata: SiteMetadata
    favicon: Favicon
    widgets: Widgets
    idpLogo: IdpLogo
    identityProviderButtons: [IdentityProviderButton]
    maintenanceMode: MaintenanceMode
  }
`;
