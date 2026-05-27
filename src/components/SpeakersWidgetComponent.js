import * as React from "react";
import * as Sentry from "@sentry/react";
import { connect } from "react-redux";
import SpeakersWidget from 'speakers-widget/dist';
import 'speakers-widget/dist/index.css';
// awesome-bootstrap-checkbox css dependency
// https://cdnjs.cloudflare.com/ajax/libs/awesome-bootstrap-checkbox/1.0.2/awesome-bootstrap-checkbox.min.css
// injected through HeadComponents
import { useClock } from "openstack-uicore-foundation/lib/components/clock-context";

import { SentryFallbackFunction } from "./SentryErrorComponent";

const SpeakersWidgetComponent = ({colorSettings, allEvents, speakers, schedules, ...props}) => {
    const now = useClock();
    const scheduleState = schedules?.find( s => s.key === 'schedule-main');

    const widgetProps = {
        date: now,
        // featured: true,
        speakersData: speakers,
        eventsData: scheduleState?.allEvents || [],
        marketingData: colorSettings,
        ...props
    };

    return (
        <>
            <div>
                <Sentry.ErrorBoundary fallback={SentryFallbackFunction({componentName: 'Speakers'})}>
                    <SpeakersWidget {...widgetProps} />
                </Sentry.ErrorBoundary>
            </div>
        </>
    )
}

const mapStateToProps = ({ allSchedulesState, speakerState, settingState }) => ({
    colorSettings: settingState.colorSettings,
    schedules: allSchedulesState.schedules,
    speakers: speakerState.speakers
});

export default connect(mapStateToProps, null)(SpeakersWidgetComponent)