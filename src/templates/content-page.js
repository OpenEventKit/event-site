import * as React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { graphql } from "gatsby";
import { Redirect } from "@gatsbyjs/reach-router";
import Seo from "../components/Seo";
import Layout from "../components/Layout";
import Content, { HTMLContent } from "../components/Content";
import { titleFromPathname } from "../utils/urlFormating";


import { USER_REQUIREMENTS } from "../cms/config/collections/contentPagesCollection"

export const ContentPageTemplate = ({
  title,
  content,
  contentComponent
}) => {
  const PageContent = contentComponent || Content

  return (
    <div className="content">
      <h1>{title}</h1>
      <PageContent content={content} />
    </div>
  )
}

ContentPageTemplate.propTypes = {
  title: PropTypes.string,
  content: PropTypes.string,
  contentComponent: PropTypes.func,
}

const ContentPage = ({ data, isLoggedUser, hasTicket, isAuthorized }) => {
  const { frontmatter: {title, userRequirement}, html } = data.markdownRemark
  // if isAuthorized byoass the AUTHZ check
  if (!isAuthorized && (
    (userRequirement === USER_REQUIREMENTS.loggedIn && !isLoggedUser) || (userRequirement === USER_REQUIREMENTS.hasTicket && !hasTicket)
  )) {
    return <Redirect to='/' noThrow />
  }

  return (
    <Layout>
      <ContentPageTemplate
        contentComponent={HTMLContent}
        title={title}
        content={html}
      />
    </Layout>
  )
}

ContentPage.propTypes = {
  data: PropTypes.shape({
    markdownRemark: PropTypes.shape({
      frontmatter: PropTypes.object,
    }),
  }),
  isLoggedUser: PropTypes.bool,
  hasTicket: PropTypes.bool
};

const mapStateToProps = ({ loggedUserState, userState }) => ({
  isLoggedUser: loggedUserState.isLoggedUser,
  hasTicket: userState.hasTicket,
  isAuthorized: userState.isAuthorized
});

export default connect(mapStateToProps, null)(ContentPage);

export const contentPageQuery = graphql`
  query ($id: String!) {    
    markdownRemark(id: { eq: $id }) {
      html
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
