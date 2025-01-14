import * as React from "react";
import { navigate } from "gatsby";
import PropTypes from "prop-types";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Mdx from "@mdx-js/runtime";
import Container from "./Container";
import LiteScheduleComponent from "../../components/LiteScheduleComponent";
import DisqusComponent from "../../components/DisqusComponent";
import ResponsiveImage from "../../components/ResponsiveImage";
import Link from "../../components/Link";

import { PHASES } from "@utils/phasesUtils";

import styles from "./styles.module.scss";

const shortcodes = {
  a: Link,
  img: ResponsiveImage
};

const onEventClick = (ev) => navigate(`/a/event/${ev.id}`);

const MainColumn = ({ widgets, summitPhase, isLoggedUser, onEventClick, lastDataSync, fullWidth, maxHeight }) => {
  const { content, schedule, disqus, image } = widgets || {};
  
  const scheduleProps = schedule && isLoggedUser && summitPhase !== PHASES.BEFORE ? { onEventClick } : {};

  return (
    <div
      className={`column pt-6 pb-5 px-6 ${!fullWidth ? "is-half" : ""} ${styles.mainColumn || ""}`}
      style={{ maxHeight: !fullWidth && maxHeight ? maxHeight : "none", overflowY: "auto" }}
    >
      <Container>
        {content?.display && content?.body && (
          <Mdx components={shortcodes}>
            {content.body}
          </Mdx>
        )}
        {schedule?.display && (
          <>
            <h2><b>{schedule.title}</b></h2>
            <LiteScheduleComponent
              {...scheduleProps}
              lastDataSync={lastDataSync}
              id={`marketing_lite_schedule_${lastDataSync}`}
              page="marketing-site"
              showAllEvents={true}
              showSearch={false}
              showNav={true}
            />
          </>
        )}
        {disqus?.display && (
          <>
            <h2><b>{disqus.title}</b></h2>
            <DisqusComponent page="marketing-site" />
          </>
        )}
        {image?.display && image?.image?.src && (
          <>
            <h2><b>{image.title}</b></h2>
            <br/>
            <GatsbyImage image={getImage(image.image.src)} alt={image.image.alt ?? ""} />
          </>
        )}
      </Container>
    </div>
  );
};

MainColumn.propTypes = {
  widgets: PropTypes.object,
  summitPhase: PropTypes.number,
  isLoggedUser: PropTypes.bool,
  lastDataSync: PropTypes.number,
  fullWidth: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default MainColumn;
