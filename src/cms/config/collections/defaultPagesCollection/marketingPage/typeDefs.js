
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
  type MarketingPageTextWidget {
    display: Boolean
    content: String
  }
  type MarketingPageImageWidget {
    display: Boolean
    title: String
    image: ImageWithAlt
  }
  type MarketingPageWidgets {
    text: MarketingPageTextWidget
    image: MarketingPageImageWidget
    schedule: MarketingPageWidget
    disqus: MarketingPageWidget
  }
  type MarketingPageCountdown {
    display: Boolean
    text: String
  }
  type MarketingPageHeroButton {
    text: String
    display: Boolean
  }
  type MarketingPageHeroButtons {
    loginButton: MarketingPageHeroButton
    registerButton: MarketingPageHeroButton
  }
  type MarketingPageHero {
    title: String
    subTitle: String
    date: String
    time: String
    dateLayout: Boolean
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
