import * as React from "react";
import PropTypes from "prop-types";
import { MDXProvider } from "@mdx-js/react";

const ContentPageTemplate = ({ title, content }) => (
  <div className="content">
    <h1>{title}</h1>
    <MDXProvider>
      {content}
    </MDXProvider>
  </div>
);

export default ContentPageTemplate;

ContentPageTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired
};
