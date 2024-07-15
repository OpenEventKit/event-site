import * as React from "react";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Masonry from "react-masonry-css";
import Slider from "react-slick";
import Link from "../../components/Link";
import { formatMasonry } from "@utils/masonry";

import styles from "./styles.module.scss";

const sliderSettings = {
  autoplay: true,
  autoplaySpeed: 5000,
  infinite: true,
  slidesToShow: 1,
  slidesToScroll: 1,
  dots: false
};

export default React.forwardRef(({ data }, ref) => (
  <div
    ref={ref}
    className={`column p-0 is-half ${styles.masonry || ""}`}
  >
    <Masonry
      className={styles.grid}
      breakpointCols={2}
    >
      {data.items && formatMasonry(data.items).map((item, index) => {
        if (item.images && item.images.length === 1) {
          const image = getImage(item.images[0].src);
          const alt = item.images[0].alt ?? "";
          if (item.images[0].link) {
            return (
              <Link key={index} to={item.images[0].link}>
                <GatsbyImage image={image} alt={alt} className={styles.masonryImage} />
              </Link>
            );
          } else {
            return <GatsbyImage key={index} image={image} alt={alt} className={styles.masonryImage} />;
          };
        } else if (item.images && item.images.length > 1) {
          return (
            <Slider
              key={index}
              className={styles.slider}
              {...sliderSettings}
            >
              {item.images.map((image, indexSlide) => {
                const img = getImage(image.src);
                const alt = image.alt ?? "";
                if (image.link) {
                  return (
                    <Link key={indexSlide} to={image.link}>
                      <GatsbyImage image={img} alt={alt} className={styles.masonryImage} />
                    </Link>
                  );
                } else {
                  return <GatsbyImage key={indexSlide} image={img} alt={alt} className={styles.masonryImage} />;
                };
              })}
            </Slider>
          );
        } else {
          return (
            <div key={index} />
          );
        }
      })}
    </Masonry>
  </div>
));
