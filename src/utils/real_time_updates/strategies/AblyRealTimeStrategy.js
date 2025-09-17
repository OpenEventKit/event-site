import AbstractRealTimeStrategy from "./AbstractRealTimeStrategy";
import { getEnvVariable, ABLY_API_KEY } from "../../envVariables";
import * as Ably from 'ably';
/**
 * AblyRealTimeStrategy
 */
class AblyRealTimeStrategy extends AbstractRealTimeStrategy {

    /**
     * @param callback
     * @param checkPastCallback
     */
    constructor(callback, checkPastCallback) {
        super(callback, checkPastCallback);
        console.log('AblyRealTimeStrategy::constructor');
        this._client = null;
        this._wsError = false;
        this._closing = false;
        this._channel = null;
        this._onConn = null;
        this._onMessage = null;
    }

    /**
     * @param summitId
     * @param lastCheckForNovelties
     */
    create(summitId) {

        super.create(summitId);
        console.log('AblyRealTimeStrategy::create');

        const key = getEnvVariable(ABLY_API_KEY);

        if(this._wsError) {
            console.warn('AblyRealTimeStrategy::create error state');
            return;
        }

        if(!key){
            console.warn('AblyRealTimeStrategy::create ABLY_KEY is not set');
            this._wsError = true;
            return;
        }

        // check if we are already connected

        if(this._client && this._client.connection){
            console.log('AblyRealTimeStrategy::create already connected');
            return;
        }

        if(this._client){
            this._client.close();
        }

        this._client = new Ably.Realtime({
            key,
            // see https://faqs.ably.com/ably-js-page-unload-behaviour
            closeOnUnload: false,
        });

        // connect handler

        this._onConn = (stateChange) => {
            const { current: state, reason } = stateChange;
            console.log(`AblyRealTimeStrategy::connection WS ${state}`, reason || '');
            if(state  === 'connected') {
                this._wsError = false;
                // RELOAD
                // check on demand ( just in case that we missed some Real time update )
                if (summitId) {
                    this._checkPastCallback(summitId);
                }
                this.stopUsingFallback();
                return;
            }

            if ((state === 'suspended' || state === 'failed') && !this._closing) {
                if(!this._wsError) {
                    this._wsError = true;
                    this.startUsingFallback(summitId);
                }
                return;
            }
            if (state === 'closed') {
                // Expected on unmount, don’t start fallback, don’t log as error
                this._wsError = false;
            }
        };

        this._client.connection.on(this._onConn);

        // start listening for event

        this._channel = this._client.channels.get(`${summitId}:*:*`);

        this._onMessage = (message) => {
            try {
                const {data: payload} = message;
                console.log('AblyRealTimeStrategy::create Change received', payload)
                this._callback(payload);
            }
            catch (e) {
                console.error('AblyRealTimeStrategy::message handler failed', e);
            }
        };

        this._channel.subscribe(this._onMessage);

    }

    close() {
        console.log("AblyRealTimeStrategy::close");
        super.close();
        this._closing = true;
        try { this.stopUsingFallback(); } catch {}

        try { this._onMessage && this._channel?.unsubscribe(this._onMessage); }
        catch (e){ console.warn('AblyRealTimeStrategy::close channel.unsubscribe',e); }
        try { this._channel?.off(); }
        catch(e) { console.warn('AblyRealTimeStrategy::close channel.off', e);}
        try { this._onConn && this._client?.connection.off(this._onConn); }
        catch(e) { console.warn('AblyRealTimeStrategy::close AblyRealTimeStrategy::close.off', e); }
        this._onMessage = null;
        this._onConn = null;

        const client = this._client;
        const channel = this._channel;

        const tryRelease = () => {
            try {
                const releasable = ['initialized','detached','failed'].includes(channel?.state);
                if (releasable) client?.channels.release(channel.name);
            } catch {}
            try { client?.close(); } catch(e) {
                console.warn('AblyRealTimeStrategy::close client.close', e);
            }
            this._client = null;
            this._channel = null;
            this._closing = false;
            this._wsError = false;
        };

        if (client && channel && client.connection.state !== 'closed' &&
            ['attached','attaching','detaching'].includes(channel.state)) {
            // Detach asynchronously, then release if allowed
            channel.detach(() => tryRelease());
        } else {
            // Already detached/failed/closed (or no channel) → just release if possible and close
            tryRelease();
        }
    }
}

export default AblyRealTimeStrategy;
