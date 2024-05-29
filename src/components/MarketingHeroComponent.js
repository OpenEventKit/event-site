import React, {
  useRef,
  useState,
  useEffect
} from "react";
import { getSrc } from "gatsby-plugin-image";
import Slider from "react-slick";
import AuthComponent from "./AuthComponent";
import RegistrationLiteComponent from "./RegistrationLiteComponent";

import styles from "../styles/marketing-hero.module.scss";

const MarketingHeroComponent = ({
  location,
  data,
}) => {

  const sliderRef = useRef(null);
  const [sliderHeight, setSliderHeight] = useState(424);

  const onResize = () => {
    sliderRef?.current && setSliderHeight(sliderRef.current.clientHeight);
  };

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize, { passive: true });
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, []);


  const getButtons = () => {
    const {
      registerButton,
      loginButton
    } = data?.buttons || {};

    return <>
      {registerButton?.display &&
      <span className={styles.link}>
        <RegistrationLiteComponent location={location} />
      </span>
      }
      {loginButton?.display &&
        <AuthComponent location={location} />
      }
    </>;
  };

  const sliderSettings = {
    autoplay: true,
    autoplaySpeed: 5000,
    infinite: true,
    dots: false,
    slidesToShow: 1,
    slidesToScroll: 1,
  };

  let heroLeftColumnInlineStyles = {};
  if (data?.background?.src) {
    const imageSrc = getSrc(data.background.src);
    heroLeftColumnInlineStyles.backgroundImage = `url(${imageSrc})`;
  }

  return (
    <section className={styles.heroMarketing}>
      <div className={`${styles.heroMarketingColumns} columns is-gapless`}>
        <div
          className={`${styles.leftColumn} column is-6`}
          style={heroLeftColumnInlineStyles}
        >
          <div className={`${styles.heroMarketingContainer} hero-body`}>
            <div className="container">
              <h1 className="title">{data?.title}</h1>
              <h2 className="subtitle">{data?.subTitle}</h2>
              <div
                className={styles.date}
                style={{
                  display: data?.dateLayout
                    ? ""
                    : "inline",
                  transform: data?.dateLayout
                    ? "skew(-25deg)"
                    : "skew(0deg)",
                }}
              >
                {data?.dateLayout ?
                <div style={{transform: "skew(25deg)"}}>{data?.date}</div>
                :
                <div style={{transform: "skew(0deg)"}}>
                  <span>{data?.date}</span>
                </div>
                }
              </div>
              <h4>{data?.time}</h4>
              <div className={styles.heroButtons}>
                {getButtons()}
              </div>
            </div>
          </div>
        </div>
        {data?.images?.length > 0 &&
        <div className={`${styles.rightColumn} column is-6 px-0`} id="marketing-slider" ref={sliderRef}>
          {data?.images?.length > 1 ?
          <Slider {...sliderSettings}>
            {data.images.map((image, index) => {
              const imageSrc = getSrc(image.src);
              return (
                <div key={index}>
                  <div className={styles.imageSlider} aria-label={image.alt} style={{ backgroundImage: `url(${imageSrc})`, height: sliderHeight, marginBottom: -6 }} />
                </div>
              );
            })}
          </Slider>
          :
          <div className={styles.singleImage} aria-label={data.images[0].alt} style={{ backgroundImage: `url(${getSrc(data.images[0].src)})`}} >
          </div>
          }
        </div>
      }
      </div>
    </section>
  );
}

export default MarketingHeroComponent;
