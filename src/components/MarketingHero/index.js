import * as React from "react";
import PropTypes from "prop-types";
import MainColumn from "./MainColumn";
import ImagesColumn from "./ImagesColumn";

import styles from "./styles.module.scss";

const MarketingHero = ({ location, data }) => {
  const {
    title,
    subTitle,
    date,
    time,
    buttons = {},
    background,
    images = []
  } = data || {};
  return (
    <section>
      <div className={"columns is-marginless"}>
        <MainColumn
          location={location}
          title={title}
          subTitle={subTitle}
          date={date}
          time={time}
          buttons={buttons}
          backgroundSrc={background?.src}
          fullWidth={images.length === 0}
        />
        {images.length > 0 && (
        <ImagesColumn images={images} />
        )}
      </div>
    </section>
  );
};

MarketingHero.propTypes = {
  location: PropTypes.string.isRequired,
  data: PropTypes.object
};

export default MarketingHero;
