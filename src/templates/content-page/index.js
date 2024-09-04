import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import { Redirect } from "@gatsbyjs/reach-router";
import { MDXProvider } from "@mdx-js/react";
import ContentPageTemplate from "./template";
import Layout from "../../components/Layout";
import Seo from "../../components/Seo";
import { titleFromPathname } from "@utils/urlFormating";

import { USER_REQUIREMENTS } from "@utils/pageAccessConstants";

const ContentPage = ({
  data,
  isAuthorized,
  isLoggedUser,
  hasTicket,
  children
}) => {
  const { frontmatter: { title, userRequirement } } = data.mdx;
  if (!isAuthorized && (
    (userRequirement === USER_REQUIREMENTS.loggedIn && !isLoggedUser) ||
    (userRequirement === USER_REQUIREMENTS.hasTicket && !hasTicket)
  )) {
    return <Redirect to="/" noThrow />;
  }
  return (
    <Layout>
      <ContentPageTemplate
        title={title}
        content={children}
      />
    </Layout>
  );
};

ContentPage.propTypes = {
  data: PropTypes.object.isRequired,
  isAuthorized: PropTypes.bool.isRequired,
  isLoggedUser: PropTypes.bool.isRequired,
  hasTicket: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired
};

const mapStateToProps = ({ loggedUserState, userState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized
});

const StoreConnectedContentPage = connect(mapStateToProps)(ContentPage);

export default StoreConnectedContentPage;

export const query = graphql`
  query($id: String!) {
    mdx(id: { eq: $id }) {
      frontmatter {
        title
        userRequirement
      }
    }
  }
`;

export const Head = ({
  location
}) => (
  <Seo
    title={titleFromPathname(location.pathname)}
    location={location}
  />
);
