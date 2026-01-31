import React from "react";
import * as Sentry from "@sentry/react";
import {connect} from "react-redux";
import {needsLogin} from "../utils/alerts";
import {
    addToSchedule,
    cancelRSVP,
    removeFromSchedule,
    RSVP_CANCELLED,
    RSVP_CONFIRMED,
    rsvpToEvent
} from "../actions/user-actions";
import {callAction, getShareLink} from "../actions/schedule-actions";

// these two libraries are client-side only
import Schedule from "full-schedule-widget/dist";
import "full-schedule-widget/dist/index.css";
import useMarketingSettings, {MARKETING_SETTINGS_KEYS} from "@utils/useMarketingSettings";
import {SentryFallbackFunction} from "./SentryErrorComponent";

const FullSchedule = ({
                          summit,
                          className,
                          userProfile,
                          colorSettings,
                          addToSchedule,
                          removeFromSchedule,
                          rsvpToEvent,
                          cancelRSVP,
                          callAction,
                          filters,
                          view,
                          allowClick = true,
                          schedKey,
                          ...rest
                      }) => {
    const {getSettingByKey} = useMarketingSettings();
    const defaultImage = getSettingByKey(MARKETING_SETTINGS_KEYS.scheduleDefaultImage);
    const summitLogoPrint = getSettingByKey(MARKETING_SETTINGS_KEYS.printLogo);
    const componentProps = {
        title: "Schedule",
        summit,
        marketingSettings: colorSettings,
        userProfile,
        withThumbs: false,
        defaultImage: defaultImage,
        summitLogoPrint: summitLogoPrint ? summitLogoPrint : null,
        showSendEmail: false,
        onStartChat: null,
        shareLink: getShareLink(filters, view),
        filters,
        view,
        onEventClick: allowClick ? () => {
        } : null,
        needsLogin: needsLogin,
        triggerAction: (action, payload) => {
            switch (action) {
                case "ADDED_TO_SCHEDULE": {
                    return addToSchedule(payload.event);
                }
                case "REMOVED_FROM_SCHEDULE": {
                    return removeFromSchedule(payload.event);
                }
                case RSVP_CONFIRMED: {
                    return rsvpToEvent(payload.event);
                }
                case RSVP_CANCELLED: {
                    return cancelRSVP(payload.event);
                }
                default:
                    return callAction(schedKey, action, payload);
            }
        },
        ...rest,
    };

    return (
        <div className={className || "schedule-container"}>
            <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Full Schedule"})}>
                <Schedule {...componentProps} />
            </Sentry.ErrorBoundary>
        </div>
    );
};

const mapStateToProps = ({userState, settingState}) => ({
    userProfile: userState.userProfile,
    colorSettings: settingState.colorSettings,
    allowClick: settingState?.widgets?.schedule?.allowClick
});

export default connect(mapStateToProps, {
    addToSchedule,
    removeFromSchedule,
    rsvpToEvent,
    cancelRSVP,
    callAction,
})(FullSchedule);
