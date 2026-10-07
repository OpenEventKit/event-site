import AuthorizationCallbackRoute from '../authorization-callback-route';
import { navigate } from 'gatsby';
import { getPendingAction } from '@utils/schedule';
import { alertWarning } from '@utils/alerts';

jest.mock('react', () => ({}), { virtual: true });
jest.mock('gatsby', () => ({ navigate: jest.fn() }), { virtual: true });
jest.mock('urijs', () => ({ decode: decodeURIComponent }), { virtual: true });
jest.mock('@gatsbyjs/reach-router', () => ({ Redirect: jest.fn() }), { virtual: true });
jest.mock('react-redux', () => ({ connect: () => Component => Component }), { virtual: true });
jest.mock('openstack-uicore-foundation/lib/security/abstract-auth-callback-route', () => class {
    constructor(idp, client, props) { this.props = props; }
}, { virtual: true });
jest.mock('../../actions/user-actions', () => ({}));
jest.mock('../../components/Interstitial', () => () => null);
jest.mock('@utils/envVariables', () => ({ getEnvVariable: jest.fn() }), { virtual: true });
jest.mock('@utils/schedule', () => ({ getPendingAction: jest.fn() }), { virtual: true });
jest.mock('@utils/alerts', () => ({ alertWarning: jest.fn() }), { virtual: true });
jest.mock('@utils/authorizedGroups', () => ({ userHasAccessLevel: () => false }), { virtual: true });
jest.mock('../../styles/bulma.scss', () => ({}));

const event = { id: 73, title: 'Selected activity' };
let props;
beforeEach(() => {
    jest.clearAllMocks();
    getPendingAction.mockReturnValue(null);
    props = {
        getUserProfile: jest.fn().mockResolvedValue(),
        addToSchedule: jest.fn().mockResolvedValue(event),
        removeFromSchedule: jest.fn().mockResolvedValue(event),
        rsvpToEvent: jest.fn().mockResolvedValue({ event_id: event.id }),
        cancelRSVP: jest.fn().mockResolvedValue(event),
    };
});

test('waits for the selected activity to save before navigating to My Schedule', async () => {
    let finishSave;
    props.addToSchedule.mockReturnValue(new Promise(resolve => { finishSave = resolve; }));
    getPendingAction.mockReturnValue({ action: 'ADD_EVENT', event });
    const done = new AuthorizationCallbackRoute(props)._callback('/schedule');
    await Promise.resolve();
    expect(props.addToSchedule).toHaveBeenCalledWith(event);
    expect(navigate).not.toHaveBeenCalled();
    finishSave(event);
    await done;
    expect(navigate).toHaveBeenCalledWith('/a/my-schedule');
    expect(navigate).toHaveBeenCalledTimes(1);
});

// The request builds its URL from the id, so an event without one must never
// reach it.
test('does not call the API when the stored event has no id', async () => {
    getPendingAction.mockReturnValue({ action: 'ADD_EVENT', event: { title: 'no id' } });
    await new AuthorizationCallbackRoute(props)._callback('/schedule');
    expect(props.addToSchedule).not.toHaveBeenCalled();
    expect(alertWarning).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/schedule');
});

test('also accepts the legacy action object', async () => {
    getPendingAction.mockReturnValue({ action: { type: 'ADD_EVENT' }, event });
    await new AuthorizationCallbackRoute(props)._callback('/schedule');
    expect(props.addToSchedule).toHaveBeenCalledWith(event);
    expect(navigate).toHaveBeenCalledWith('/a/my-schedule');
});

test.each(['resolved', 'rejected'])('reports a %s API failure without claiming the activity was saved', async mode => {
    const error = new Error('Request failed');
    props.addToSchedule[mode === 'resolved' ? 'mockResolvedValue' : 'mockRejectedValue'](error);
    getPendingAction.mockReturnValue({ action: 'ADD_EVENT', event });
    await new AuthorizationCallbackRoute(props)._callback('/schedule');
    expect(alertWarning).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/schedule');
    expect(navigate).not.toHaveBeenCalledWith('/a/my-schedule');
});

test('ordinary login retains its return URL', async () => {
    await new AuthorizationCallbackRoute(props)._callback('%2Fschedule');
    expect(props.addToSchedule).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith('/schedule');
});

test.each([
    ['REMOVE_EVENT', 'removeFromSchedule'],
    ['ADD_RSVP', 'rsvpToEvent'],
    ['REMOVE_RSVP', 'cancelRSVP'],
])('recognizes the widget string action %s', async (action, handler) => {
    getPendingAction.mockReturnValue({ action, event });
    await new AuthorizationCallbackRoute(props)._callback('/schedule');
    expect(props[handler]).toHaveBeenCalledWith(event);
    expect(navigate).toHaveBeenCalledWith('/schedule');
});

// These actions reject when the access token cannot be refreshed. The user
// must still be sent on rather than left on the "Checking credentials" screen.
test.each([
    ['REMOVE_EVENT', 'removeFromSchedule'],
    ['ADD_RSVP', 'rsvpToEvent'],
    ['REMOVE_RSVP', 'cancelRSVP'],
])('still sends the user on when %s fails', async (action, handler) => {
    props[handler].mockRejectedValue(new Error('token refresh failed'));
    getPendingAction.mockReturnValue({ action, event });
    await new AuthorizationCallbackRoute(props)._callback('/schedule');
    expect(navigate).toHaveBeenCalledWith('/schedule');
    expect(navigate).toHaveBeenCalledTimes(1);
});
