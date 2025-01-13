import * as React from "react";
import { getImage, getSrc } from "gatsby-plugin-image";
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
                <img src={getSrc(image)} alt={alt} />
              </Link>
            );
          } else {
            return <img key={index} src={getSrc(image)} alt={alt} />;
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
                      <img src={getSrc(img)} alt={alt} />
                    </Link>
                  );
                } else {
                  return <img key={indexSlide} src={getSrc(img)} alt={alt} />;
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
