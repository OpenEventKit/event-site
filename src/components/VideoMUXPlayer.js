import React, { useState, useEffect, useRef } from 'react'
import MuxPlayer from '@mux/mux-player-react/lazy';

import { getEnvVariable, MUX_ENV_KEY } from '../utils/envVariables'
import { checkMuxTokens, getMUXPlaybackId } from '../utils/videoUtils';

const VideoMUXPlayer = ({ title, namespace, videoSrc, streamType, tokens, isSecure, autoPlay, ...muxOptions }) => {

  const playerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);


  useEffect(() => {    
  }, [tokens])

  useEffect(() => {
  }, [videoSrc]);

  const handleVideoEnded = () => {
    if (streamType === "live") {
      setIsPlaying(false);
    }

    //       this.player.on('ended', () => {        
    //         if (isLive) {
    //           this.player.pause();
    //           modal = this.player.createModal();
    //           modal.closeable(false);
    //           let newElement = document.createElement('div');
    //           newElement.classList.add('video-error');
    //           let message = 'VOD will be available soon';
    //           newElement.innerHTML = `
    //             <section class="hero">
    //               <div class="hero-body">
    //                 <div class='has-text-centered'}>
    //                   <h1 class="title">${message}</h1>               
    //                 </div>
    //               </div>
    //             </section>
    //             `
    //           modal.content(newElement);
    //           modal.fill();
    //         }
    //       });
    //     }
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
          // video_id: "video-id-54321",
          // viewer_user_id: "user-id-007",
        }}

        {...muxOptions}
      />
  );
}

export default VideoMUXPlayer;


//       this.player.on('error', () => {
//         const videoError = this.player.error();        
//         if ((firstHalf !== null && videoError.code === 2) || videoError.code === 4) {
//           if (reloadPlayer === null) {
//             this.player.errorDisplay.close();
//             modal = this.player.createModal();
//             modal.closeable(false);
//             let newElement = document.createElement('div');
//             newElement.classList.add('video-error');
//             let message = firstHalf ? 'This video stream will begin momentarily. Please standby.' : 'This video will be available on-demand shortly.<br>Please return to this page at your convenience.';
//             newElement.innerHTML = `
//               <section class="hero">
//                 <div class="hero-body">
//                   <div class='has-text-centered'}>
//                     <h1 class="title">${message}</h1> 
//                   </div>
//                 </div>
//               </section>
//               `
//             modal.content(newElement);
//             modal.fill();
//             if (firstHalf) {
//               reloadPlayer = setInterval(() => {
//                 // reload player
//                 this.player.load();
//                 this.player.src(src);
//                 this.player.reset();
//               }, 60000);
//             }
//           }
//         }
//       });