import {
  graphql,
  useStaticQuery
} from "gatsby";

const siteSettingsQuery = graphql`
  query {
    siteSettingsJson {
      favicons {
        favicon16 {
          childImageSharp {
            gatsbyImageData (
              quality: 100
            )
          }
        }
        favicon32 {
          childImageSharp {
            gatsbyImageData (
              quality: 100
            )
          }
        }
        favicon180 {
          childImageSharp {
            gatsbyImageData (
              quality: 100
            )
          }
        }
      }
      widgets {
        chat {
          defaultScope
          showHelp
          showQA
        }
        schedule {
          allowClick
        }
      }
    }
  }
`;

const useSiteSettings = () => {
  const { siteSettingsJson } = useStaticQuery(siteSettingsQuery);
  return siteSettingsJson;
};

export default useSiteSettings;
