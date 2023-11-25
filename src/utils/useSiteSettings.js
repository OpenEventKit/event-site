import {
  graphql,
  useStaticQuery
} from "gatsby";

const siteSettingsQuery = graphql`
  query {
    siteSettingsJson {
      siteMetadata {
        title,
        description,
        image {
          childImageSharp {
            gatsbyImageData (
              quality: 100
            )
          }
        }
      }
      widgets {
        chat {
          enabled
          defaultScope
          showHelp
          showQA
        }
        schedule {
          allowClick
        }
      }
    }
    siteFallback: site {
      siteMetadata {
        description
        title
      }
    }
  }
`;

const useSiteSettings = () => {
  const { siteSettingsJson, siteFallback } = useStaticQuery(siteSettingsQuery);
  const siteMetadata = siteSettingsJson.siteMetadata ? siteSettingsJson.siteMetadata : siteFallback.siteMetadata;
  return {...siteSettingsJson, siteMetadata };
};

export default useSiteSettings;
