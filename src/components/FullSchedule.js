import React, {useMemo} from "react";
import * as Sentry from "@sentry/react";
import {connect} from "react-redux";
import {needsLogin} from "../utils/alerts";
import {
    cancelRSVP,
    RSVP_CANCELLED,
    RSVP_CONFIRMED,
    rsvpToEvent
} from "../actions/user-actions";
import {callAction, getShareLink} from "../actions/schedule-actions";
import {executeUserIntent, USER_INTENT} from "../actions/user-intents";

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
                          executeUserIntent,
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
    // profiles persisted before the reducer fix may still hold the serialized share info
    // object; the widget builds the sync link only from a string, and re-derives its
    // events on every new userProfile reference, so only copy the profile when needed
    const scheduleUserProfile = useMemo(() => {
        const shareableLink = userProfile?.schedule_shareable_link;
        if (!shareableLink || typeof shareableLink === "string") return userProfile;
        return {...userProfile, schedule_shareable_link: shareableLink.link};
    }, [userProfile]);
    const componentProps = {
        title: "Schedule",
        summit,
        marketingSettings: colorSettings,
        userProfile: scheduleUserProfile,
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
                    return executeUserIntent({ type: USER_INTENT.AddToSchedule, event: payload.event });
                }
                case "REMOVED_FROM_SCHEDULE": {
                    return executeUserIntent({ type: USER_INTENT.RemoveFromSchedule, event: payload.event });
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
    executeUserIntent,
    rsvpToEvent,
    cancelRSVP,
    callAction,
})(FullSchedule);
