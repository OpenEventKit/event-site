import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types';
import MuxPlayer from '@mux/mux-player-react/lazy';

import { getEnvVariable, MUX_ENV_KEY } from '../utils/envVariables'
import { checkMuxTokens, getMUXPlaybackId } from '../utils/videoUtils';

const VideoMUXPlayer = ({ title, namespace, videoSrc, streamType, tokens, isSecure, autoPlay, ...muxOptions }) => {

  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const handleVideoEnded = () => {
    if (streamType === "live") {
      setIsPlaying(false);
    }    
  }

  return (
    isSecure && !checkMuxTokens(tokens) ?
      null :
      <MuxPlayer
        ref={playerRef}
        streamType={streamType}
        envKey={getEnvVariable(MUX_ENV_KEY)}
        playbackId={getMUXPlaybackId(videoSrc)}
        onError={(err) => console.log('Error: ', err)}
        onEnded={handleVideoEnded}
        tokens={{
          playback: tokens.playback_token,
          thumbnail: tokens.thumbnail_token,
          storyboard: tokens.storyboard_token,
        }}
        autoPlay={isPlaying}
        metadata={{
          video_title: { title },
          sub_property_id: { namespace },
        }}
        {...muxOptions}
      />
  );
}

VideoMUXPlayer.propTypes = {
  videoSrc: PropTypes.string.isRequired,
  title: PropTypes.string,
  namespace: PropTypes.string,
  streamType: PropTypes.oneOfType(["live", "on-demand"]),
  autoPlay: PropTypes.bool,  
  isSecure: PropTypes.bool,
  tokens: PropTypes.object
};

title, namespace, videoSrc, streamType, tokens, isSecure, autoPlay

export default VideoMUXPlayer;