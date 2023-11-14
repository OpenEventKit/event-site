import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";

export const MARKETING_SETTINGS_KEYS = {
  disqusThreadsBy: "disqus_threads_by",
  disqusExcludeEvents: "disqus_exclude_events",
  disqusExcludeTracks: "disqus_exclude_tracks",
  registrationInPersonDisclaimer: "registration_in_person_disclaimer",
  scheduleDefaultImage: "schedule_default_image",
  fullScheduleSummitLogoPrint: "FULL_SCHEDULE_SUMMIT_LOGO_PRINT",
  summitDeltaStartTime: "summit_delta_start_time",
  activityCtaText: "ACTIVITY_CTA_TEXT",
  regLiteAllowPromoCodes: "REG_LITE_ALLOW_PROMO_CODES",
  regLiteCompanyDDLPlaceholder: "REG_LITE_COMPANY_DDL_PLACEHOLDER",
  regLiteShowCompanyInput: "REG_LITE_SHOW_COMPANY_INPUT",
  regLiteShowCompanyInputDefaultOptions: "REG_LITE_SHOW_COMPANY_INPUT_DEFAULT_OPTIONS",
  regLiteInitialOrderComplete1stParagraph: "REG_LITE_INITIAL_ORDER_COMPLETE_STEP_1ST_PARAGRAPH",
  regLiteInitialOrderComplete2ndParagraph: "REG_LITE_INITIAL_ORDER_COMPLETE_STEP_2ND_PARAGRAPH",
  regLiteInitialOrderCompleteButton: "REG_LITE_INITIAL_ORDER_COMPLETE_BTN_LABEL",
  regLiteOrderComplete1stParagraph: "REG_LITE_ORDER_COMPLETE_STEP_1ST_PARAGRAPH",
  regLiteOrderComplete2ndParagraph: "REG_LITE_ORDER_COMPLETE_STEP_2ND_PARAGRAPH",
  regLiteOrderCompleteButton: "REG_LITE_ORDER_COMPLETE_BTN_LABEL",
  regLiteNoAllowedTicketsMessage: "REG_LITE_NO_ALLOWED_TICKETS_MESSAGE",
}


const marketingSettingsQuery = graphql`
  query {
    allMarketingSettingsJson {
      nodes {
        key
        value
      }
    }
  }
`;

const useMarketingSettings = () => {
  const { allMarketingSettingsJson } = useStaticQuery(marketingSettingsQuery);
  const getSettingByKey = (key) =>
      allMarketingSettingsJson.nodes.find(setting => setting.key === key)?.value;
  return { getSettingByKey };
};

export default useMarketingSettings;

// HOC for use on class based components 
export const withMarketingSettings = (Component) => (
  (props) => {
    const { getSettingByKey } = useMarketingSettings();
    return (
      <Component
        {...props}
        getMarketingSettingByKey={getSettingByKey}
      />
    );
  }
);
