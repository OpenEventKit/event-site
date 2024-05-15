import * as React from "react";
import PropTypes from "prop-types";
import ContentPageTemplate from "../../templates/content-page/template";

const ContentPagePreview = ({ entry, widgetFor }) =>
  <ContentPageTemplate
    title={entry.getIn(["data", "title"])}
    content={widgetFor("body")}
  />;

ContentPagePreview.propTypes = {
  entry: PropTypes.shape({
    getIn: PropTypes.func
  }),
  widgetFor: PropTypes.func
};

export default ContentPagePreview;
