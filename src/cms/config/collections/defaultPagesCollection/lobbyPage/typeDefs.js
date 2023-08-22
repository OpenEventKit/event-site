
module.exports = `
  type Button {
    text: String
    link: String
  }
  type ImageWithAlt {
    src: File @fileByRelativePath
    alt: String
  }
  type LobbyPageCenterColumnSpeakersWidget {
    showTodaySpeakers: Boolean
    showFeatureSpeakers: Boolean
  }
  type LobbyPageCenterColumn {
    speakers: LobbyPageCenterColumnSpeakersWidget
  }
  type LobbyPageHero {
    title: String
    subTitle: String
    background: ImageWithAlt
  }
  type LobbyPageJson implements Node {
    hero: LobbyPageHero
    centerColumn: LobbyPageCenterColumn
    liveNowFeaturedEventId: String
    sponsorsWidgetButton: Button
  }
`;
