import * as React from "react";
import PropTypes from "prop-types";
import { MDXProvider } from "@mdx-js/react";
import Container from "./Container";

import shortcodes from "./shortcodes";

const ContentPageTemplate = ({ title, content }) => (
  <Container className="content">
    <h1>{title}</h1>
    <MDXProvider components={shortcodes}>
      {content}
    </MDXProvider>
  </Container>
);

export default ContentPageTemplate;

ContentPageTemplate.propTypes = {
  title: PropTypes.string.isRequired,
  content: PropTypes.node.isRequired
};
