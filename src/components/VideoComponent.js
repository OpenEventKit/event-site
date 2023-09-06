import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import VideoJSPlayer from './VideoJSPlayer';
import VimeoPlayer from "./VimeoPlayer";

import styles from '../styles/video.module.scss';
import VideoMUXPlayer from './VideoMUXPlayer';
import { isLiveVideo, isMuxVideo, isVimeoVideo, isYouTubeVideo } from '../utils/videoUtils';

const VideoComponent = ({ url, title, namespace, firstHalf, autoPlay, start, isSecure, tokens }) => {

    if (url) {
        // using mux player
        if(isMuxVideo(url)) {
            const muxOptions = {
                muted: !!autoPlay,
                startTime: start,
            };
            return (
                <VideoMUXPlayer streamType={isLiveVideo(url) ? "live" : "on-demand"} isSecure={isSecure} autoPlay={autoPlay}
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
        // video.js mux live
        if (isLiveVideo(url)) {
            const videoJsOptions = {
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
                start: start,
                sources: [{
                    src: url,
                    type: 'application/x-mpegURL'
                }],
            };
            return (                
                <VideoJSPlayer title={title} namespace={namespace} firstHalf={firstHalf} {...videoJsOptions} />
            );
        };

        const customOptions = isYouTubeVideo(url) ? {
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
            sources: [{
                src: url
            }],
        };

        const videoJsOptions = {
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
            ...customOptions
        };

        return (
            <VideoJSPlayer title={title} namespace={namespace} {...videoJsOptions} />
        );
    }
    return (<span className="no-video">No video URL Provided</span>);
};

VideoComponent.propTypes = {
    url: PropTypes.string.isRequired,
    title: PropTypes.string,
    namespace: PropTypes.string,
    firstHalf: PropTypes.bool,
    autoPlay: PropTypes.bool,
};

VideoComponent.defaultProps = {
    title: '',
    namespace: '',
    firstHalf: true,
    autoPlay: false,
};

export default VideoComponent;

const videoPropsAreEqual = (prevVideo, nextVideo) => prevVideo.url === nextVideo.url;

export const MemoizedVideoComponent = React.memo(VideoComponent, videoPropsAreEqual);
