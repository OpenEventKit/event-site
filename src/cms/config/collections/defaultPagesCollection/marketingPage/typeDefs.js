
module.exports = `
  type ImageWithAlt {
    src: File @fileByRelativePath
    alt: String
  }
  type LinkImageWithAlt {
    src: File @fileByRelativePath
    alt: String
    link: String
  }
  type MarketingPageMasonryItem {
    display: Boolean
    placement: String
    size: Int
    images: [LinkImageWithAlt]
  }
  type MarketingPageMasonry {
    display: Boolean
    items: [MarketingPageMasonryItem]
  }
  type MarketingPageWidget {
    display: Boolean
    title: String
  }
  type MarketingPageContentWidget {
    display: Boolean
    body: String @resolveImages
  }
  type MarketingPageImageWidget {
    display: Boolean
    title: String
    image: ImageWithAlt
  }
  type MarketingPageWidgets {
    content: MarketingPageContentWidget
    schedule: MarketingPageWidget
    disqus: MarketingPageWidget
    image: MarketingPageImageWidget
  }
  type MarketingPageCountdown {
    display: Boolean
    text: String
  }
  type MarketingPageHeroRegistrationButton {
    text: String
    display: Boolean
    externalRegistrationLink: String
  }
  type MarketingPageHeroLoginButton {
    text: String
    display: Boolean
  }
  type MarketingPageHeroButtons {
    loginButton: MarketingPageHeroLoginButton
    registerButton: MarketingPageHeroRegistrationButton
  }
  type MarketingPageHero {
    title: String
    subTitle: String
    date: String
    time: String
    images: [ImageWithAlt]
    background: ImageWithAlt
    buttons: MarketingPageHeroButtons
  }
  type MarketingPageJson implements Node {
    hero: MarketingPageHero
    countdown: MarketingPageCountdown
    widgets: MarketingPageWidgets
    masonry: MarketingPageMasonry
    eventRedirect: Int
  }
`;
