import {
  graphql,
  useStaticQuery
} from "gatsby";

const siteSettingsQuery = graphql`
  query {
    siteSettingsJson {
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
  }
`;

const useSiteSettings = () => {
  const { siteSettingsJson } = useStaticQuery(siteSettingsQuery);
  return siteSettingsJson;
};

export default useSiteSettings;
