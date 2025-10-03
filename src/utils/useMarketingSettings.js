import * as React from "react";
import { graphql, useStaticQuery } from "gatsby";

export const DISPLAY_OPTIONS = {
  show: "SHOW",
  hide: "HIDE"
};

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
  regLiteOrderCompleteTitle: "REG_LITE_ORDER_COMPLETE_TITLE",
  regLiteOrderComplete1stParagraph: "REG_LITE_ORDER_COMPLETE_STEP_1ST_PARAGRAPH",
  regLiteOrderComplete2ndParagraph: "REG_LITE_ORDER_COMPLETE_STEP_2ND_PARAGRAPH",
  regLiteOrderCompleteButton: "REG_LITE_ORDER_COMPLETE_BTN_LABEL",
  regLiteNoAllowedTicketsMessage: "REG_LITE_NO_ALLOWED_TICKETS_MESSAGE",
  // Color settings (from scssUtils/defaults)
  colorAccent: "color_accent",
  colorAlerts: "color_alerts",
  colorBackgroundLight: "color_background_light",
  colorBackgroundDark: "color_background_dark",
  colorButtonBackgroundColor: "color_button_background_color",
  colorButtonColor: "color_button_color",
  colorGrayLighter: "color_gray_lighter",
  colorGrayLight: "color_gray_light",
  colorGrayDark: "color_gray_dark",
  colorGrayDarker: "color_gray_darker",
  colorHorizontalRuleLight: "color_horizontal_rule_light",
  colorHorizontalRuleDark: "color_horizontal_rule_dark",
  colorIconLight: "color_icon_light",
  colorInputBackgroundColorLight: "color_input_background_color_light",
  colorInputBackgroundColorDark: "color_input_background_color_dark",
  colorInputBorderColorLight: "color_input_border_color_light",
  colorInputBorderColorDark: "color_input_border_color_dark",
  colorInputTextColorLight: "color_input_text_color_light",
  colorInputTextColorDark: "color_input_text_color_dark",
  colorInputTextColorDisabledLight: "color_input_text_color_disabled_light",
  colorInputTextColorDisabledDark: "color_input_text_color_disabled_dark",
  colorPrimary: "color_primary",
  colorPrimaryContrast: "color_primary_contrast", 
  colorSecondary: "color_secondary",
  colorSecondaryContrast: "color_secondary_contrast",
  colorTextLight: "color_text_light",
  colorTextMed: "color_text_med",
  colorTextDark: "color_text_dark",
  colorTextInputHintsLight: "color_text_input_hints_light",
  colorTextInputHintsDark: "color_text_input_hints_dark",
  colorTextInputHints: "color_text_input_hints",
  // Certificate of Attendance settings
  certificateEnabled: "CERTIFICATE_ENABLED",
  certificateHeight: "CERTIFICATE_HEIGHT",
  certificateWidth: "CERTIFICATE_WIDTH",
  certificateMainColor: "CERTIFICATE_MAIN_COLOR",
  certificateLogo: "CERTIFICATE_LOGO",
  certificateLogoWidth: "CERTIFICATE_LOGO_WIDTH",
  certificateLogoHeight: "CERTIFICATE_LOGO_HEIGHT",
  certificateTitleText: "CERTIFICATE_TITLE_TEXT",
  certificateAttendeeTitleText: "CERTIFICATE_ATTENDEE_TITLE_TEXT",
  certificateSpeakerTitleText: "CERTIFICATE_SPEAKER_TITLE_TEXT",
  certificateSummitName: "CERTIFICATE_SUMMIT_NAME",
  certificateShowRole: "CERTIFICATE_SHOW_ROLE",
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
