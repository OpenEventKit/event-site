import React from 'react';
import { connect } from 'react-redux';
import Clock from 'openstack-uicore-foundation/lib/components/clock';
import { updateClock } from '../actions/clock-actions';
import { isUserAdminOrTester } from '../utils/authorizedGroups';

const ClockComponent = ({
  active,
  summit,
  updateClock,
  userProfile,
}) => {
  return (
    <div>
      {active && summit &&
        <Clock canUseNowParam={() => userProfile ? isUserAdminOrTester(userProfile.groups) : false} onTick={(timestamp) => updateClock(timestamp)} timezone={summit.time_zone_id} />
      }
    </div>
  );
}

const mapStateToProps = ({ userState }) => ({
  userProfile: userState.userProfile,
});

export default connect(mapStateToProps, { updateClock })(ClockComponent);