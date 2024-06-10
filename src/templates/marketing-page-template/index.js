import React, { useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import { navigate } from "gatsby";
import Layout from "../../components/Layout";
import AttendanceTrackerComponent from "../../components/AttendanceTrackerComponent";
import MarketingHero from "../../components/MarketingHero";
import Countdown from "../../components/Countdown";
import Link from "../../components/Link";
import MainColumn from "./MainColumn";
import Masonry from "./Masonry";
import { useResize } from "@utils/hooks";
import { PHASES } from "@utils/phasesUtils";

import styles from "./styles.module.scss";

const onEventClick = (ev) => navigate(`/a/event/${ev.id}`);

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
  const scheduleProps = useCallback(() => {
    if (widgets?.schedule && isLoggedUser && summitPhase !== PHASES.BEFORE) {
      return { onEventClick };
    }
    return {};
  }, [widgets, isLoggedUser, summitPhase]);
  const shouldRenderMasonry = masonry?.display;
  return (
    <Layout marketing={true} location={location}>
      <AttendanceTrackerComponent />
      <MarketingHero location={location} data={hero} />
      {summit && countdown?.display && <Countdown summit={summit} text={countdown?.text} />}
      <div className="columns is-marginless">
        <MainColumn
          widgets={widgets}
          scheduleProps={scheduleProps}
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
