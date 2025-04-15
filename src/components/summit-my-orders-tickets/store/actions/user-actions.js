import {
    authErrorHandler,
    putRequest,
    createAction,
    stopLoading,
    startLoading
} from 'openstack-uicore-foundation/lib/utils/actions';

export const START_LOADING_IDP_PROFILE = 'START_LOADING_IDP_PROFILE';
export const STOP_LOADING_IDP_PROFILE = 'STOP_LOADING_IDP_PROFILE';
export const UPDATE_IDP_PROFILE = 'UPDATE_IDP_PROFILE';
export const SET_USER = 'SET_USER';

export const setUser = (user) => (dispatch) => dispatch(createAction(SET_USER)(user));

export const updateProfile = (profile) => async (dispatch, getState, { getAccessToken, idpBaseUrl, loginUrl }) => {
    const accessToken = await getAccessToken().catch(() => {
        dispatch(stopLoading());
        console.log('REJECTING PROMISE AFTER STOP LOADING')
        return Promise.reject();
    });

    if (!accessToken) return Promise.reject();

    dispatch(startLoading());

    const params = {
        access_token: accessToken,
    };

    dispatch(createAction(START_LOADING_IDP_PROFILE)());

    return putRequest(
        null,
        createAction(UPDATE_IDP_PROFILE),
        // TODO: need IDP_BASE_URL
        `${idpBaseUrl}/api/v1/users/me`,
        profile,
        authErrorHandler
    )(params)(dispatch)
        .catch(() => dispatch(createAction(STOP_LOADING_IDP_PROFILE)()));
};
