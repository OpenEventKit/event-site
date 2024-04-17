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
      idpLogo {
        idpLogoDark
        idpLogoLight
        idpLogoAlt
      }
      identityProviderButtons {
        buttonColor
        buttonBorderColor
        providerLabel
        providerParam
        providerLogo {
          publicURL
        }
        providerLogoSize
      }
    }
  }
`;

const useSiteSettings = () => {
  const { siteSettingsJson } = useStaticQuery(siteSettingsQuery);
  return siteSettingsJson;
};

export default useSiteSettings;
