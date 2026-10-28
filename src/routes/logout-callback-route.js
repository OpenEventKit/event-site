/**
 * Copyright 2020
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
import React from 'react';
import { connect } from 'react-redux';
import { navigate } from "gatsby"
import { Redirect } from "@gatsbyjs/reach-router";
import URI from "urijs"
import { clearAuthInfo, getIdToken, getLogoutUrl } from 'openstack-uicore-foundation/lib/security/methods'
import { doLogout } from 'openstack-uicore-foundation/lib/security/actions'
import { getFromLocalStorage } from 'openstack-uicore-foundation/lib/utils/methods'
import { persistor } from '../state/store'

export class LogOutCallbackRoute extends React.Component {

    constructor(props) {
        super(props);

        // initial state
        this.state = {
            error: null,
            error_description: null,
        };
    }

    componentDidMount() {
        let {location} = this.props;

        let postLogoutState = getFromLocalStorage('post_logout_state', true);
        if (postLogoutState) {
            // if we have the nonce we alredy start a logout process
            let query = URI.parseQuery(location.search);
            // compare the state and perform the final logout
            if (query.hasOwnProperty("state") && query["state"] === postLogoutState) {
                let backUrl = getFromLocalStorage('post_logout_redirect_path', true);
                this.props.doLogout();
                // clear current state , bc unmounted widgets will not receive the LOG_OUT event
                if(typeof window !== 'undefined') {
                    window.localStorage.clear();
                }
                navigate(backUrl ? backUrl : '/');
                return;
            }
            // error
            clearAuthInfo();
            this.props.doLogout();
            persistor.flush().then(() =>
                this.setState({...this.state, error: 'Invalid Nonce', error_description:'There was an error on logout process. Please try again.'}));
            return;
        }
        // starts logout process
        let backUrl = location.state?.backUrl ? location.state.backUrl : '/';
        window.localStorage.setItem('post_logout_redirect_path', backUrl);
        // build the end-session url while the id_token is still stored, then drop the session before leaving
        const logoutUrl = getLogoutUrl(getIdToken()).toString();
        clearAuthInfo();
        this.props.doLogout();
        // flush so the logged-out redux state is on disk before the page unloads
        persistor.flush().then(() => window.location.replace(logoutUrl));
    }

    render() {
        let { error, error_description } = this.state;
        if(error){
            return <Redirect to={`/error?error=${error}&error_description=${error_description}`} noThrow/>;
        }
        return null;
    }
}

export default connect(
    null,
    {
        doLogout
    }
)(LogOutCallbackRoute)
