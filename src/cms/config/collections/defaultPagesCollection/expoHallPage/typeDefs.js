
module.exports = `
  type ImageWithAlt {
    src: File @fileByRelativePath
    alt: String
  }
  type ExpoHallPageHero {
    title: String
    subTitle: String
    background: ImageWithAlt
  }
  type ExpoHallPageJson implements Node {
    hero: ExpoHallPageHero
  }
`;