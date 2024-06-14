import React, { useRef, useState } from "react";
import PropTypes from "prop-types";
import Layout from "../../components/Layout";
import AttendanceTrackerComponent from "../../components/AttendanceTrackerComponent";
import MarketingHero from "../../components/MarketingHero";
import Countdown from "../../components/Countdown";
import MainColumn from "./MainColumn";
import Masonry from "./Masonry";
import { useResize } from "@utils/hooks";

import styles from "./styles.module.scss";

const MarketingPageTemplate = ({ data, location, summit, summitPhase, isLoggedUser, lastDataSync }) => {
  const masonryRef = useRef();
  const [rightColumnHeight, setRightColumnHeight] = useState();

  const onResize = () => {
    if (masonryRef?.current) {
      setRightColumnHeight(masonryRef.current.firstChild.clientHeight);
    }
  };
  
  useResize(onResize);

  const {
    marketingPageJson: {
      hero,
      countdown,
      widgets,
      masonry
    } = {}
  } = data || {};

  const shouldRenderMasonry = masonry?.display;

  return (
    <Layout marketing={true} location={location}>
      <AttendanceTrackerComponent />
      <MarketingHero location={location} data={hero} />
      {summit && countdown?.display && <Countdown summit={summit} text={countdown?.text} />}
      <div className="columns is-marginless">
        <MainColumn
          widgets={widgets}
          summitPhase={summitPhase}
          isLoggedUser={isLoggedUser}
          maxHeight={rightColumnHeight}
          fullWidth={!shouldRenderMasonry}
          lastDataSync={lastDataSync}
        />
        {shouldRenderMasonry &&
        <Masonry data={masonry} ref={masonryRef} />
        }
      </div>
    </Layout>
  );
};

MarketingPageTemplate.propTypes = {
  location: PropTypes.object,
  data: PropTypes.object,
  lastDataSync: PropTypes.number,
  summit: PropTypes.object,
  summitPhase: PropTypes.number,
  isLoggedUser: PropTypes.bool
};

export default MarketingPageTemplate;
