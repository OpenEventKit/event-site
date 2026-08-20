import React, {useEffect, useState} from "react";
import { connect } from "react-redux";
import { compose } from "redux";
import { useLocation } from '@reach/router';
import Interstitial from "../components/Interstitial";
import { clearFilters, callAction, updateFilter, updateFiltersFromHash, updateCustomEventIdsFromHash } from "../actions/schedule-actions";
import { reloadScheduleData } from '../actions/base-actions';

// This HOC makes sure the schedules array in allSchedulesState is populated before render.

const componentWrapper = (WrappedComponent) => ({schedules, ...props}) => {
  const [loaded, setLoaded] = useState(false);
  const { updateFiltersFromHash, updateCustomEventIdsFromHash, reloadScheduleData, schedKey, summit, staticJsonFilesBuildTime } = props;
  const scheduleState = schedules?.find( s => s.key === schedKey);
  const { key, filters, view } = scheduleState || {};
  const location = useLocation();

  useEffect(() => {
    if (schedules.length > 0) {
      updateFiltersFromHash(schedKey, filters, view);
      updateCustomEventIdsFromHash(schedKey);
      setLoaded(true);
    }
  }, [key, location.hash]);

  if (!loaded)
    return <Interstitial title="Loading schedule data" />;

  return <WrappedComponent {...props} scheduleState={scheduleState} />;
};

const mapStateToProps = ({
  summitState,
  clockState,
  loggedUserState,
  allSchedulesState,
  settingState,
}) => ({
  summit: summitState.summit,
  summitPhase: clockState.summit_phase,
  isLoggedUser: loggedUserState.isLoggedUser,
  schedules: allSchedulesState.schedules,
  colorSettings: settingState.colorSettings,
  staticJsonFilesBuildTime: settingState.staticJsonFilesBuildTime,
  lastDataSync: settingState.lastDataSync,
});

const reduxConnection = connect(mapStateToProps, {
  updateFiltersFromHash,
  updateCustomEventIdsFromHash,
  updateFilter,
  clearFilters,
  callAction,
  reloadScheduleData,
});

const withScheduleData = compose(reduxConnection, componentWrapper);

export default withScheduleData;