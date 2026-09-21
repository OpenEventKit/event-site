/**
 * Copyright 2023 OpenStack Foundation
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
import URI from "urijs"
import React from 'react'
import {connect} from "react-redux";
import { getAuthUrl } from "openstack-uicore-foundation/lib/security/methods";
import { getEnvVariable, TENANT_ID } from "@utils/envVariables";

/**
 * class LogInCallbackRoute
 */
class LogInCallbackRoute extends React.Component {


    constructor(props) {
        super(props);

        this.state = {
            error: null
        };
    }

    componentWillMount() {
        const {doLogin, location} = this.props;
        const query = URI.parseQuery(location.search);
        // the fragment never reaches the server, so the token stays out of access logs
        const fragment = URI.parseQuery((location.hash || '').replace(/^#/, ''));
        let loginHint = null;
        let otpLoginHint = null;
        let backUrl = '/';

        if (query["login_hint"]) {
            loginHint = encodeURI(query["login_hint"]);
        }

        if (query["backUrl"]) {
            backUrl = encodeURI(query["backUrl"]);
        }

        if (query["otp_login_hint"]) {
            otpLoginHint = encodeURI(query["otp_login_hint"]);
        }

        const idTokenHint = fragment["id_token_hint"] || query["id_token_hint"];

        if (idTokenHint) {
            // SSO handoff from an external caller (native app) holding an id_token.
            // login_hint / otp_login_hint are intentionally NOT forwarded: the IDP
            // evaluates them before id_token_hint, which would silently drop the token hint.
            const url = getAuthUrl(backUrl, null, idTokenHint, null, null, null, getEnvVariable(TENANT_ID));
            window.location.replace(url.toString());
            return;
        }

        doLogin(backUrl, loginHint, otpLoginHint, null, null, getEnvVariable(TENANT_ID));
    }


    render() {
        if (this.state.error != null) {
            return (<p>{this.state.error}</p>)
        }
        return null;
    }
}

export default connect(null)(LogInCallbackRoute);
