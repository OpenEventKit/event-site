import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types';
import { getEnvVariable, MUX_ENV_KEY } from '../utils/envVariables'
import { getMUXPlaybackId } from '../utils/videoUtils';
// lazy load bc otherwise SSR breaks
// @see https://www.gatsbyjs.com/docs/using-client-side-only-packages/
const MuxPlayer = React.lazy(() => import('@mux/mux-player-react'));

const VideoMUXPlayer = ({ title, namespace, videoSrc, streamType, tokens, autoPlay, onError = () => {}, ...muxOptions }) => {

  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handleVideoEnded = () => {
    if (streamType === "live") {
      setIsPlaying(false);
    }    
  }

  const secureProps = tokens ? { tokens: {
    playback: tokens?.playback_token,
    thumbnail: tokens?.thumbnail_token,
    storyboard: tokens?.storyboard_token,
  }} : {}

    const isSSR = typeof window === "undefined"
    return (
        <>
            {!isSSR && (
                <React.Suspense fallback={<></>}>
                <MuxPlayer
                    ref={playerRef}
                    streamType={streamType}
                    envKey={getEnvVariable(MUX_ENV_KEY)}
                    playbackId={getMUXPlaybackId(videoSrc)}
                    onError={(err) => {
                      if(onError) onError(err);
                      console.log(err);
                    }}
                    onEnded={handleVideoEnded}
                    autoPlay={isPlaying}
                    metadata={{
                      video_title: {title},
                      sub_property_id: {namespace},
                    }}
                    style={{aspectRatio: 16 / 9}}
                    {...secureProps}
                    {...muxOptions}
                />
                </React.Suspense>
            )}
        </>
    );

}

VideoMUXPlayer.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  title: PropTypes.string,
  namespace: PropTypes.string,
  streamType: PropTypes.oneOfType(["live", "on-demand"]),
  autoPlay: PropTypes.bool,
  tokens: PropTypes.object,
  onError:PropTypes.func,
};

export default VideoMUXPlayer;