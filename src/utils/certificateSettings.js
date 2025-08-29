import useMarketingSettings, { MARKETING_SETTINGS_KEYS, DISPLAY_OPTIONS } from './useMarketingSettings';

export const useCertificateSettings = (siteFont = null) => {
  const { getSettingByKey } = useMarketingSettings();
  
  const certificateKeys = {
    // general summit keys
    colorAccent: MARKETING_SETTINGS_KEYS.colorAccent,
    colorPrimary: MARKETING_SETTINGS_KEYS.colorPrimary,
    colorPrimaryContrast: MARKETING_SETTINGS_KEYS.colorPrimaryContrast,
    colorSecondary: MARKETING_SETTINGS_KEYS.colorSecondary,
    colorTextDark: MARKETING_SETTINGS_KEYS.colorTextDark,
    colorTextLight: MARKETING_SETTINGS_KEYS.colorTextLight,
    // certificate specific
    enabled: MARKETING_SETTINGS_KEYS.certificateEnabled,
    height: MARKETING_SETTINGS_KEYS.certificateHeight,
    width: MARKETING_SETTINGS_KEYS.certificateWidth,
    mainColor: MARKETING_SETTINGS_KEYS.certificateMainColor,
    logo: MARKETING_SETTINGS_KEYS.certificateLogo,
    logoWidth: MARKETING_SETTINGS_KEYS.certificateLogoWidth,
    logoHeight: MARKETING_SETTINGS_KEYS.certificateLogoHeight,
    titleText: MARKETING_SETTINGS_KEYS.certificateTitleText,
    summitName: MARKETING_SETTINGS_KEYS.certificateSummitName,
    showRole: MARKETING_SETTINGS_KEYS.certificateShowRole,
  };

  const certificateSettings = {};
  
  Object.entries(certificateKeys).forEach(([propName, key]) => {
    const value = getSettingByKey(key);
    if (value !== undefined) {
      certificateSettings[propName] = value;
    }
  });

  certificateSettings.enabled = certificateSettings.enabled !== DISPLAY_OPTIONS.hide;
  certificateSettings.showRole = certificateSettings.showRole !== DISPLAY_OPTIONS.hide;
  
  // Pass through the site font information if available
  if (siteFont) {
    certificateSettings.siteFont = siteFont;
  }
  
  return certificateSettings;
};