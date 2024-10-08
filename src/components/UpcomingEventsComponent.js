import * as React from "react";
import * as Sentry from "@sentry/react";
import { connect } from "react-redux";

// these two libraries are client-side only
import UpcomingEvents from "upcoming-events-widget/dist";
import "upcoming-events-widget/dist/index.css";
// awesome-bootstrap-checkbox css dependency
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents

import { addToSchedule, removeFromSchedule } from "../actions/user-actions";

import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { SentryFallbackFunction } from "./SentryErrorComponent";

const UpcomingEventsComponent = ({
  className,
  userProfile,
  page,
  addToSchedule,
  removeFromSchedule,
  colorSettings,
  schedules,
  summit,
  ...rest
}) => {
  const wrapperClass = page === "marketing-site" ? "schedule-container-marketing" : "schedule-container";
  const { getSettingByKey } = useMarketingSettings();
  const defaultImage = getSettingByKey(MARKETING_SETTINGS_KEYS.scheduleDefaultImage);
  const scheduleState = schedules?.find( s => s.key === 'schedule-main');

  const componentProps = {
    defaultImage: defaultImage,
    eventsData: scheduleState?.allEvents || [],
    summitData: summit,
    marketingData: colorSettings,
    userProfile: userProfile,
    showAllEvents: true,
    triggerAction: (action, { event }) => {
      switch (action) {
        case "ADDED_TO_SCHEDULE": {
          return addToSchedule(event);
        }
        case "REMOVED_FROM_SCHEDULE": {
          return removeFromSchedule(event);
        }
        default:
          return;
      }
    },
  };

  return (
    <div id="upcoming-events" className={className || wrapperClass} style={{ height: 500 }}>
      <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Upcoming Events'})}>
        <UpcomingEvents {...componentProps} {...rest} />
      </Sentry.ErrorBoundary>
    </div>
  );
};

const mapStateToProps = ({ userState, summitState, allSchedulesState, settingState }) => ({
  userProfile: userState.userProfile,
  colorSettings: settingState.colorSettings,
  summit: summitState.summit,
  schedules: allSchedulesState.schedules,
});

export default connect(mapStateToProps, {
  addToSchedule,
  removeFromSchedule
})(UpcomingEventsComponent);
