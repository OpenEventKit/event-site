import useMarketingSettings, { MARKETING_SETTINGS_KEYS, DISPLAY_OPTIONS } from './useMarketingSettings';

// Custom hook to get certificate settings with marketing settings fallbacks
export const useCertificateSettings = (summit = null, siteFont = null) => {
  const { getSettingByKey } = useMarketingSettings();
  
  // Get fallback values from marketing settings using proper keys
  const colorAccent = getSettingByKey(MARKETING_SETTINGS_KEYS.colorAccent);
  const colorPrimary = getSettingByKey(MARKETING_SETTINGS_KEYS.colorPrimary);
  const colorPrimaryContrast = getSettingByKey(MARKETING_SETTINGS_KEYS.colorPrimaryContrast);
  const colorSecondary = getSettingByKey(MARKETING_SETTINGS_KEYS.colorSecondary);
  const colorTextDark = getSettingByKey(MARKETING_SETTINGS_KEYS.colorTextDark);
  const colorTextLight = getSettingByKey(MARKETING_SETTINGS_KEYS.colorTextLight);
  
  const certificateKeys = {
    enabled: MARKETING_SETTINGS_KEYS.certificateEnabled,
    backgroundImage: MARKETING_SETTINGS_KEYS.certificateBackgroundImage,
    borderColor: MARKETING_SETTINGS_KEYS.certificateBorderColor,
    logo: MARKETING_SETTINGS_KEYS.certificateLogo,
    titleText: MARKETING_SETTINGS_KEYS.certificateTitleText,
    subtitleText: MARKETING_SETTINGS_KEYS.certificateSubtitleText,
  };

  const certificateSettings = {};
  
  Object.entries(certificateKeys).forEach(([propName, key]) => {
    const value = getSettingByKey(key);
    if (value !== undefined) {
      certificateSettings[propName] = value;
    }
  });

  // Set defaults
  certificateSettings.enabled = certificateSettings.enabled !== DISPLAY_OPTIONS.hide;
  
  // Apply fixed defaults for consistent design
  certificateSettings.width = "11in";
  certificateSettings.height = "8.5in";
  certificateSettings.margin = 72;
  certificateSettings.backgroundColor = "#ffffff";
  certificateSettings.fontFamily = "Helvetica";
  
  // Colors - use marketing colors as fallback
  certificateSettings.borderColor = certificateSettings.borderColor || colorAccent || "#ff5e32";
  certificateSettings.titleColor = colorTextDark || "#000000";
  certificateSettings.subtitleColor = colorAccent || "#ff5e32";
  certificateSettings.nameColor = colorTextDark || "#000000";
  certificateSettings.companyColor = colorTextDark || "#000000";
  certificateSettings.roleColor = colorTextDark || "#000000";
  
  // Fixed font sizes for consistent design
  certificateSettings.titleFontSize = 26;
  certificateSettings.subtitleFontSize = 36;
  certificateSettings.nameFontSize = 44;
  certificateSettings.companyFontSize = 30;
  certificateSettings.roleFontSize = 30;
  
  // Logo settings - use custom or summit logo
  certificateSettings.logo = certificateSettings.logo || summit?.logo;
  certificateSettings.logoWidth = 150;
  certificateSettings.logoHeight = 80;
  
  // Text content
  certificateSettings.titleText = certificateSettings.titleText || "CERTIFICATE OF ATTENDANCE";
  certificateSettings.subtitleText = certificateSettings.subtitleText || summit?.name || "EVENT NAME";
  

  return certificateSettings;
};