
module.exports = `
  type ImageHeader {
    image: File @fileByRelativePath
    alt: String
  }
  type LobbyButton {
    text: String
    link: String
  }  
  type ExpoHallSettingsJson implements Node {
    imageHeader: ImageHeader
    lobbyButton: LobbyButton
  }
`;
