import * as React from "react";
import PropTypes from "prop-types";
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import Mdx from "@mdx-js/runtime";
import Container from "./Container";
import LiteScheduleComponent from "../../components/LiteScheduleComponent";
import DisqusComponent from "../../components/DisqusComponent";
import ResponsiveImage from "../../components/ResponsiveImage";
import Link from "../../components/Link";

import styles from "./styles.module.scss";

const shortcodes = {
  a: Link,
  img: ResponsiveImage
};

const MainColumn = ({ widgets, scheduleProps, lastDataSync, fullWidth, maxHeight }) => (
  <div
    className={`column pt-6 pb-5 px-6 ${!fullWidth ? "is-half" : ""} ${styles.mainColumn || ""}`}
    style={{ maxHeight: !fullWidth && maxHeight ? maxHeight : "none", overflowY: "auto" }}
  >
    <Container>
      {widgets?.content?.display && widgets?.content?.body && (
      <Mdx components={shortcodes}>
        {widgets.content.body}
      </Mdx>
      )}
      {widgets?.schedule?.display && (
      <>
        <h2><b>{widgets.schedule.title}</b></h2>
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
      {widgets?.disqus?.display && (
      <>
        <h2><b>{widgets.disqus.title}</b></h2>
        <DisqusComponent page="marketing-site" />
      </>
      )}
     {widgets?.image?.display && widgets?.image?.image.src && (
      <>
        <h2><b>{widgets.image.title}</b></h2>
        <br />
        <GatsbyImage image={getImage(widgets.image.image.src)} alt={widgets.image.image.alt ?? ""} />
      </>
      )}
    </Container>
  </div>
);

MainColumn.propTypes = {
  widgets: PropTypes.object,
  scheduleProps: PropTypes.object,
  lastDataSync: PropTypes.number,
  fullWidth: PropTypes.bool,
  maxHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
};

export default MainColumn;

