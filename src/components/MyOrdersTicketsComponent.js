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
const MyOrdersMyTicketsWidget = loadable(() => import("my-orders-tickets-widget/dist/index"), {
    ssr: false,
    fallback: null,
});

export const MyOrdersTicketsComponent = () => {
    const dispatch = useDispatch();
    const user = useSelector(state => state.userState);
    const summit = useSelector(state => state.summitState.summit);

    if (!summit) return null;

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
        onTicketAssigned: (ticket) => dispatch(ticketOwnerChange(ticket))
    };

    return (
      <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'My Orders & Tickets'})}>
          <MyOrdersMyTicketsWidget {...widgetProps} />
      </Sentry.ErrorBoundary>
    );
};
