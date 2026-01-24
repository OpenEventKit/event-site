import React from 'react';
import * as Sentry from "@sentry/react";
import { useDispatch, useSelector } from 'react-redux';
import { getAccessToken } from 'openstack-uicore-foundation/lib/security/methods';
import { getEnvVariable, SUMMIT_API_BASE_URL, OAUTH2_CLIENT_ID, SUPPORT_EMAIL } from '../utils/envVariables';
import { getUserProfile, ticketOwnerChange,updateProfile } from '../actions/user-actions';
import loadable from "@loadable/component";
import 'my-orders-tickets-widget/dist/index.css';
import 'my-orders-tickets-widget/dist/i18n';
import { SentryFallbackFunction } from "./SentryErrorComponent";
import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from '../utils/useMarketingSettings';
import useSiteSettings from '../utils/useSiteSettings';
import { DEFAULT_FONT_FAMILY, DEFAULT_FONT_PATH, getFontUrl } from '../utils/pdfFonts';
const MyOrdersMyTicketsWidget = loadable(() => import("my-orders-tickets-widget/dist/index"), {
    ssr: false,
    fallback: null,
});

export const MyOrdersTicketsComponent = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.userState);
    const summit = useSelector(state => state.summitState.summit);
    const { getSettingByKey } = useMarketingSettings();
    const siteSettings = useSiteSettings();

    if (!summit) return null;

    // Get font info from site settings, defaulting to Nunito Sans
    const siteFont = siteSettings?.siteFont;
    let fontFamily = DEFAULT_FONT_FAMILY;
    let fontFile = getFontUrl(DEFAULT_FONT_PATH);

    // Use custom site font if configured
    if (siteFont?.fontFamily && siteFont?.regularFont?.fontFile) {
        fontFamily = siteFont.fontFamily;
        fontFile = getFontUrl(siteFont.regularFont.fontFile);
    }

    // Build receipt settings from marketing settings
    const receiptSettings = {
        primaryColor: getSettingByKey(MARKETING_SETTINGS_KEYS.colorPrimary),
        fontFamily,
        fontFile,
        printLogo: getSettingByKey(MARKETING_SETTINGS_KEYS.printLogo),
        organizerLegalName: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerLegalName),
        organizerAddressLine1: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerAddressLine1),
        organizerAddressLine2: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerAddressLine2),
        organizerCity: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerCity),
        organizerState: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerState),
        organizerPostalCode: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerPostalCode),
        organizerCountry: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerCountry),
        organizerTaxId: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerTaxId),
        organizerTaxIdLabel: getSettingByKey(MARKETING_SETTINGS_KEYS.receiptOrganizerTaxIdLabel),
        supportEmail: summit.support_email || getEnvVariable(SUPPORT_EMAIL),
    };

    const widgetProps = {
        apiBaseUrl: getEnvVariable(SUMMIT_API_BASE_URL),
        clientId: getEnvVariable(OAUTH2_CLIENT_ID),
        supportEmail: summit.support_email || getEnvVariable(SUPPORT_EMAIL),
        loginUrl: '/',
        getAccessToken,
        getUserProfile: async () => await dispatch(getUserProfile()),
        updateProfile: (profile) =>  dispatch(updateProfile(profile)),
        summit,
        user,
        receiptSettings,
        onTicketAssigned: (ticket) => dispatch(ticketOwnerChange(ticket))
    };

    return (
      <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'My Orders & Tickets'})}>
          <MyOrdersMyTicketsWidget {...widgetProps} />
      </Sentry.ErrorBoundary>
    );
};
