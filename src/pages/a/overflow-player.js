import React, { useEffect, useState,  useCallback, useRef } from "react";
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { getOverflowEventByKey } from "../../actions/event-actions";
import { Container, Box, CircularProgress, Typography, Fade } from "@mui/material";
import VideoComponent from "../../components/VideoComponent";
import ErrorMessage from "../../components/ErrorMessage";
import withRealTimeUpdates from "../../utils/real_time_updates/withRealTimeUpdates";
import { useOrientation } from "../../utils/hooks";
import "../../i18n";
import {useAblyChannel} from "../../utils/real_time_updates/useAblyChannel";

const TITLE_DISPLAY_DURATION = 3000;

const OverflowPlayerPage = ({
                                location,
                                fetchOverflowEvent,
                                loading,
                                event,
                                error
                            }) => {
    const params = new URLSearchParams(location.search);
    const overflowStreamKey = params.get("k");
    const { t } = useTranslation();
    const [showTitleFlash, setShowTitleFlash] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const { isPortrait } = useOrientation();
    const latestEventIdRef = useRef(null);

    useEffect(() => {
        if (event?.id) {
            latestEventIdRef.current = event.id;
        }
    }, [event]);

    const onAblyMessage = useCallback((msg) => {
        debugger;
        const { data } = msg || {};
        const { entity_id, params: { overflow_url } = {} } = data || {};
        const currentId = latestEventIdRef.current;
        if (overflow_url === "" && Number(entity_id) === Number(currentId)) {
            setOverflowStreamKey("");
        }
    }, []); // this is YOUR dep


    useAblyChannel({
        channelName: `${window.SUMMIT_ID}:OVERFLOW:*`,
        onMessage: onAblyMessage,
    });

    const flashTitle = () => {
        setShowTitleFlash(true);
        const timer = setTimeout(() => {
            setShowTitleFlash(false);
        }, TITLE_DISPLAY_DURATION);
        return () => clearTimeout(timer);
    };

    useEffect(() => {
        if (overflowStreamKey) {
            fetchOverflowEvent(overflowStreamKey);
        }
    }, [overflowStreamKey, fetchOverflowEvent]);

    useEffect(() => {
        if (event && !loading && !error) {
            return flashTitle();
        }
    }, [event, loading, error]);

    useEffect(() => {
        if (!isPortrait) {
            return flashTitle();
        }
    }, [isPortrait]);

    const handleVideoError = (e) => {
        console.error("Video error:", e);
        setVideoError(true);
        setShowTitleFlash(false);
    };

    const vimeoOverrides = {
        '& .video-module--vimeoPlayer--ac603': {
            paddingBottom: '0 !important',
            height: isPortrait ? '100% !important' : '100vh !important',
            '& iframe': {
                width: isPortrait ? '100% !important' : '100vw !important',
                height: isPortrait ? '100% !important' : '100vh !important',
                position: 'absolute',
                top: 0,
                left: 0
            }
        }
    };

    const videoProps = {
        url: event?.overflow_streaming_url,
        title: event?.title,
        isLive: true,
        autoPlay: true,
        tokens: event?.overflow_tokens,
        onError: handleVideoError
    };

    if (!overflowStreamKey) {
        return (
            <ErrorMessage
                title={t('overflow_player.stream_unavailable.title')}
                message={t('overflow_player.no_stream_key')}
                fullScreen={true}
            />
        );
    }

    return (
        <>
            {loading || (!event && !error && overflowStreamKey) ? (
                <Container maxWidth={false}>
                    <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                        <CircularProgress sx={{ color: 'var(--color_accent)' }} />
                    </Box>
                </Container>
            ) : error ? (
                <ErrorMessage
                    title={t('overflow_player.stream_unavailable.title')}
                    message={t('overflow_player.stream_unavailable.message')}
                    fullScreen={true}
                />
            ) : event ? (
                videoError ? (
                    <ErrorMessage
                        title={t('overflow_player.stream_unavailable.title')}
                        message={t('overflow_player.stream_unavailable.message')}
                        fullScreen={true}
                    />
                ) : (
                    isPortrait ? (
                        <Box
                            width="100vw"
                            minHeight="100vh"
                            display="flex"
                            flexDirection="column"
                            bgcolor="var(--color_secondary)"
                        >
                            <Box
                                position="relative"
                                width="100%"
                                sx={{
                                    aspectRatio: '16/9',
                                    maxHeight: '40vh',
                                    ...vimeoOverrides
                                }}
                            >
                                <VideoComponent {...videoProps} />
                            </Box>

                            <Box
                                bgcolor="var(--color_secondary)"
                                color="white"
                                p={2}
                                flex={1}
                            >
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    sx={{
                                        fontWeight: 'bold',
                                        mb: 1
                                    }}
                                >
                                    {event.title}
                                </Typography>
                            </Box>
                        </Box>
                    ) : (
                        <Box
                            width="100vw"
                            height="100vh"
                            position="relative"
                            sx={vimeoOverrides}
                        >
                            <VideoComponent {...videoProps} />

                            <Fade in={showTitleFlash} timeout={500}>
                                <Typography
                                    variant="h3"
                                    component="h1"
                                    position="absolute"
                                    top="50%"
                                    left="50%"
                                    sx={{
                                        transform: 'translate(-50%, -50%)',
                                        color: 'white',
                                        fontWeight: 'bold',
                                        textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                                        zIndex: 1000,
                                        maxWidth: '80%',
                                        textAlign: 'center'
                                    }}
                                >
                                    {event.title}
                                </Typography>
                            </Fade>
                        </Box>
                    )
                )
            ) : (
                <ErrorMessage
                    title={t('overflow_player.no_stream_available.title')}
                    message={t('overflow_player.no_stream_available.message')}
                    fullScreen={true}
                />
            )}
        </>
    );
};

const mapStateToProps = ({ eventState }) => ({
    loading: eventState.loading,
    event: eventState.event,
    error: eventState.error
});

const mapDispatchToProps = (dispatch) => ({
    fetchOverflowEvent: (streamKey) => dispatch(getOverflowEventByKey(streamKey))
});

export default connect(mapStateToProps, mapDispatchToProps)(withRealTimeUpdates(OverflowPlayerPage));