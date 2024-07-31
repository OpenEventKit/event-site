import * as React from "react";
import * as Sentry from "@sentry/react";
import {connect} from "react-redux";

// these two libraries are client-side only
import LiteSchedule from "lite-schedule-widget/dist";
import "lite-schedule-widget/dist/index.css";
// awesome-bootstrap-checkbox css dependency 
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents

import {addToSchedule, removeFromSchedule} from "../actions/user-actions";

import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { SentryFallbackFunction } from "./SentryErrorComponent";

const LiteScheduleComponent = ({
   className = "schedule-container",
   userProfile,
   colorSettings,
   addToSchedule,
   removeFromSchedule,
   schedules,
   summit,
   schedKey = "schedule-main",
   ...rest
}) => {
  const { getSettingByKey } = useMarketingSettings();
  const defaultImage = getSettingByKey(MARKETING_SETTINGS_KEYS.schedultDefaultImage);
  const scheduleState = schedules?.find( s => s.key === schedKey);

  const componentProps = {
    defaultImage: defaultImage,
    eventsData: scheduleState?.allEvents || [],
    summitData: summit,
    marketingData: colorSettings,
    userProfile: userProfile,
    triggerAction: (action, {event}) => {
      switch (action) {
        case "ADDED_TO_SCHEDULE": {
          return addToSchedule(event);
        }
        case "REMOVED_FROM_SCHEDULE": {
          return removeFromSchedule(event);
        }
        default: {
          return;
        }
      }
    }
  };

  return (
    <div className={className}>
      <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: "Schedule Lite"})}>
        <LiteSchedule {...componentProps} {...rest} />
      </Sentry.ErrorBoundary>
    </div>
  )
};

const mapStateToProps = ({userState, summitState, allSchedulesState, settingState}) => ({
  userProfile: userState.userProfile,
  schedules: allSchedulesState.schedules,
  summit: summitState.summit,
  colorSettings: settingState.colorSettings
});

export default connect(mapStateToProps, {addToSchedule, removeFromSchedule})(LiteScheduleComponent)
