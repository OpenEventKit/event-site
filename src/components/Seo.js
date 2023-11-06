import * as React from "react";
import { Helmet } from "react-helmet";
import useSiteMetadata from "@utils/useSiteMetadata";
import { withPrefix } from "gatsby";
import { getSrc } from "gatsby-plugin-image";

const Seo = ({
  title,
  description,
  pathname,
  children
}) => {
  const {
    title: defaultTitle,
    description: defaultDescription,
  } = useSiteMetadata();
  const seo = {
    title: title ? `${defaultTitle} - ${title}` : defaultTitle,
    description: description || defaultDescription,
    url: `${withPrefix(pathname || "/")}`
  }
  return (
    <Helmet>
      <title>{seo.title}</title>
      <meta name="description" content={seo.description} />
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:url" content={seo.url} />
      <meta name="twitter:description" content={seo.description} />
      <meta property="og:type" content="business.business" />
      <meta property="og:title" content={seo.title} />
      <meta property="og:url" content={seo.url} />
      {children}
    </Helmet>
  )
};

export default Seo;
