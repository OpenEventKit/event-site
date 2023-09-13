import * as React from "react";
import { connect } from "react-redux";
import Slider from "react-slick";
import Link from "../components/Link";
import { getSponsorURL } from "../utils/urlFormating";

import styles from "../styles/sponsor.module.scss";

const TierWrapper = ({title, index, wrapperExtraClass, children}) => (
  <div className={`${index === 0 ? styles.firstContainer : ""} ${wrapperExtraClass}`} key={`tier-${index}`}>
    {title &&
      <span><b>{title}</b></span>
    }
    {children}
  </div>
);

const SponsorComponent = ({ page, sponsorsState, linkButton }) => {
  let renderButton = false;

  const sponsorsByTier = sponsorsState.reduce((result, it) => {
    let sponsorship = result.find(s => s.id === it.sponsorship.id);
    if (!sponsorship) {
      const idx = result.push({...it.sponsorship, sponsors: []});
      sponsorship = result[idx - 1];
    }
    sponsorship.sponsors.push(it);
    return result;
  }, []).sort((a, b) => a.order - b.order);

  const getSponsorImage = (sponsor, settings = {} ) => {
    const {hideWrapper = false, overrideImg, overrideAlt, wrapperExtraClass = ''} = settings;
    const imageUrl = overrideImg || sponsor.company.big_logo || sponsor.company.logo;
    const alt = overrideAlt || sponsor.company.name;
    const link = sponsor.is_published ? `/a/sponsor/${getSponsorURL(sponsor.id, sponsor.company.name)}` : sponsor.external_link;

    if (!imageUrl) return null;

    let imageTag = <img src={imageUrl} alt={alt} />;

    if (link) {
      imageTag = (
        <Link to={link}>
          {imageTag}
        </Link>
      );
    }

    if (!hideWrapper) {
      imageTag = (
        <div className={`${styles.imageBox} ${wrapperExtraClass}`}>
          {imageTag}
        </div>
      );
    }

    return React.cloneElement(imageTag, { key: `${sponsor.id}-image` });
  };

  return (
    <>
      {sponsorsByTier.map((tier, tierIndex) => {
        const sponsors = tier.sponsors.sort((a, b) => a.order - b.order);

        const template = ['lobby', 'event'].includes(page) ? tier[`${page}_template`] : 'expo-hall';
        const hideTier = (page === "lobby" && !tier.should_display_on_lobby_page) || (template === "expo-hall" && !tier.should_display_on_expo_hall_page)

        if (!sponsors?.length > 0 || hideTier) return null;

        renderButton = true;


        switch (template) {
          case "big-images": {
            return (
              <TierWrapper title={tier.widget_title} index={tierIndex} wrapperExtraClass={styles.bigImageContainer}>
                {sponsors.map(sponsor => getSponsorImage(sponsor,{hideWrapper: true}))}
              </TierWrapper>
            )
          }
          case "small-images": {
            return (
              <TierWrapper title={tier.widget_title} index={tierIndex} wrapperExtraClass={styles.smallImageContainer}>
                {sponsors.map((sponsor, index) => {
                  if (page === "event" && !sponsor.showLogoInEventPage) return null
                  return getSponsorImage(sponsor);
                })}
              </TierWrapper>
            )
          }
          case "horizontal-images": {
            return (
              <TierWrapper index={tierIndex} wrapperExtraClass={styles.horizontalContainer}>
                {sponsors.map(getSponsorImage)}
              </TierWrapper>
            )
          }
          case "expo-hall": {
            return (
              <div className={`${styles.expoContainer} px-6`} key={tierIndex}>
                {sponsors.map(sponsor => {
                  const wrapperExtraClass = tier.expo_hall_template === "big-images" ? styles.large : tier.expo_hall_template === "medium-images" ? styles.medium : styles.small;
                  return getSponsorImage(sponsor, {wrapperExtraClass});
                })}
              </div>
            )
          }
          case "carousel": {
            const sliderSettings = {
              autoplay: true,
              autoplaySpeed: 5000,
              infinite: true,
              className: "sponsor-carousel",
              dots: false,
              slidesToShow: 1,
              slidesToScroll: 1
            };
            return (
              <TierWrapper
                title={tier.widget_title}
                index={tierIndex}
                wrapperExtraClass={styles.carouselContainer}
              >
                <Slider {...sliderSettings}>
                  {sponsors.map((sponsor, index) => {
                    const settings = {
                      hideWrapper: true,
                      overrideImg: sponsor.carousel_advertise_image,
                      overrideAlt: sponsor.carousel_advertise_image_alt_text
                    }
                    return getSponsorImage(sponsor, settings);
                  })}
                </Slider>
              </TierWrapper>
            )
          }
          default:
            return null;
        }
      })}
      {linkButton?.text && linkButton?.link && renderButton &&
        <Link className={styles.link} to={linkButton.link}>
          <button className={`${styles.button} button is-large`}>
            {linkButton.text}
          </button>
        </Link>
      }
    </>
  )
};

const mapStateToProps = ({ sponsorState }) => ({
  sponsorsState: sponsorState.sponsors
});

export default connect(mapStateToProps, {})(SponsorComponent);
