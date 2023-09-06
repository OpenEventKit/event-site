import React from 'react';
import PropTypes from 'prop-types';

import VideoJSPlayer from './VideoJSPlayer';
import VimeoPlayer from "./VimeoPlayer";

import styles from '../styles/video.module.scss';
import VideoMUXPlayer from './VideoMUXPlayer';
import { isMuxVideo, isVimeoVideo, isYouTubeVideo } from '../utils/videoUtils';

const VideoComponent = ({ url, title, namespace, isLive, firstHalf, autoPlay, start, tokens }) => {

    if (url) {
        // using mux player
        if(isMuxVideo(url)) {
            const muxOptions = {
                muted: !!autoPlay,
                startTime: start,
            };
            return (
                <VideoMUXPlayer isLive={isLive ? "live" : "on-demand"} autoPlay={autoPlay}
                    title={title} namespace={namespace} videoSrc={url} tokens={tokens} {...muxOptions} />
            );
        }
        // vimeo player
        if (isVimeoVideo(url)) {
            return (
                <VimeoPlayer
                    video={url}
                    autoplay={autoPlay}
                    start={start}
                    className={styles.vimeoPlayer}
                />
            );
        };

        const defaultVideoJsOptions = isYouTubeVideo(url) ? {
            techOrder: ["youtube"],
            sources: [{
                type: "video/youtube",
                src: url
            }],
            youtube: {
                ytControls: 0,
                iv_load_policy: 1
            },
        }: {
            autoplay: autoPlay,
            /*
             TIP: If you want to use autoplay and improve the chances of it working, use the muted attribute
             (or the muted option, with Video.js).
             @see https://blog.videojs.com/autoplay-best-practices-with-video-js/
             */
            muted: !!autoPlay,
            controls: true,
            fluid: true,
            playsInline: true,
            start: isLive ? start : null,
            sources: isLive ?
            [{
                src: url,
                type: 'application/x-mpegURL'
            }]
            :
            [{
                src: url
            }]
            ,
        };

        const firstHalfProp = isLive ? {firstHalf: firstHalf} : {}

        return (
            <VideoJSPlayer title={title} namespace={namespace} {...firstHalfProp} {...defaultVideoJsOptions} />
        );
    }
    return (<span className="no-video">No video URL Provided</span>);
};

VideoComponent.propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    namespace: PropTypes.string,
    isLive: PropTypes.bool,
    firstHalf: PropTypes.bool,
    autoPlay: PropTypes.bool,
    start: PropTypes.number,    
    tokens: PropTypes.object
};

VideoComponent.defaultProps = {
    title: '',
    namespace: '',
    firstHalf: true,
    autoPlay: false,    
    tokens: null,
};

export default VideoComponent;

const videoPropsAreEqual = (prevVideo, nextVideo) => prevVideo.url === nextVideo.url;

export const MemoizedVideoComponent = React.memo(VideoComponent, videoPropsAreEqual);
