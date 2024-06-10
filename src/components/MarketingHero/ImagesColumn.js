import * as React from "react";
import { GatsbyImage, getImage, getSrc } from "gatsby-plugin-image";
import Slider from "react-slick";

import styles from "./styles.module.scss";

const sliderSettings = {
  autoplay: false,
  autoplaySpeed: 5000,
  infinite: true,
  dots: false,
  slidesToShow: 1,
  slidesToScroll: 1
};

const ImagesColumn = ({ images }) => {
  return images.length === 0 ? null : (
    <div className={`column is-half p-0 ${styles.imagesColumn}`}>
      {images.length > 1 ? (
        <Slider {...sliderSettings} >
          {images.map((image, index) => (
          <img
            key={index}
            src={getSrc(image.src)}
            alt={image.alt}
          />
          ))}
        </Slider>
      ) : (
        <GatsbyImage
          className={styles.singleImage}
          image={getImage(images[0].src)}
          alt={images[0].alt}
        />
      )}
    </div>
  );
}

export default ImagesColumn;

