import { useEffect, useRef, useState } from "react";
import { Realtime } from "ably";
import { getEnvVariable, ABLY_API_KEY } from "../envVariables";

export function useAblyChannel({
                                   channelName,
                                   onMessage,
                                   clientOptions = {},
                                   deps = [],
                               }) {
    const clientRef = useRef(null);
    const channelRef = useRef(null);
    const [connectionState, setConnectionState] = useState("initialized");

    useEffect(() => {
        const key = getEnvVariable(ABLY_API_KEY);
        const client = new Realtime({ key, ...clientOptions });
        clientRef.current = client;

        const handleConn = () => setConnectionState(client.connection.state);
        client.connection.on(handleConn);

        const channel = client.channels.get(channelName);
        channelRef.current = channel;

        if (onMessage) channel.subscribe(onMessage);

        return () => {
            if (onMessage) channel.unsubscribe(onMessage);
            client.connection.off(handleConn);
            client.close();
        };
    }, [channelName]);

    return { connectionState };
}
