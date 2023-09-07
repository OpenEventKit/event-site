import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types';
import MuxPlayer from '@mux/mux-player-react';
import Swal from 'sweetalert2';

import { getEnvVariable, MUX_ENV_KEY } from '../utils/envVariables'
import { getMUXPlaybackId } from '../utils/videoUtils';

const VideoMUXPlayer = ({ title, namespace, videoSrc, streamType, tokens, autoPlay, ...muxOptions }) => {

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

  return (
    <MuxPlayer
      ref={playerRef}
      streamType={streamType}
      envKey={getEnvVariable(MUX_ENV_KEY)}
      playbackId={getMUXPlaybackId(videoSrc)}
      onError={(err) => {
        Swal.fire('Error', 'This video stream will begin momentarily. Please standby.', "warning");
        console.log(err);
      }}
      onEnded={handleVideoEnded}
      autoPlay={isPlaying}
      metadata={{
        video_title: { title },
        sub_property_id: { namespace },
      }}
      style={{ aspectRatio: 16/9 }}
      {...secureProps}
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
  tokens: PropTypes.object
};

export default VideoMUXPlayer;