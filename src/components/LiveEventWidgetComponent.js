import * as React from "react";
import * as Sentry from "@sentry/react";
import {connect} from "react-redux";

// these two libraries are client-side only
import LiveEventWidget from 'live-event-widget/dist/index.js';
import 'live-event-widget/dist/index.css';
// awesome-bootstrap-checkbox css dependency 
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents

import useMarketingSettings, { MARKETING_SETTINGS_KEYS } from "@utils/useMarketingSettings";
import { SentryFallbackFunction } from "./SentryErrorComponent";

const LiveEventWidgetComponent = ({
  allEvents,
  summit,
  colorSettings,
  className = "live-event-container",
  ...rest
}) => {
  const { getSettingByKey } = useMarketingSettings();
  const defaultImage = getSettingByKey(MARKETING_SETTINGS_KEYS.schedultDefaultImage);
  const widgetProps = {
    title: "",
    defaultImage: defaultImage,
    eventsData: allEvents,
    summitData: summit,
    marketingData: colorSettings,
    ...rest
  };

  return (
    <div className={className}>
      <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Live Event'})}>
        <LiveEventWidget {...widgetProps} />
      </Sentry.ErrorBoundary>
    </div>
  )
};

const mapStateToProps = ({ summitState, allSchedulesState, settingState }) => ({
  summit: summitState.summit,
  allEvents: allSchedulesState.allEvents,
  colorSettings: settingState.colorSettings
});

export default connect(mapStateToProps, { })(LiveEventWidgetComponent);
