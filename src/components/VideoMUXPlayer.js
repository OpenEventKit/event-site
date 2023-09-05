import React, { useState, useEffect, useRef } from 'react'
import MuxPlayer from '@mux/mux-player-react';

import { getEnvVariable, MUX_ENV_KEY } from '../utils/envVariables'

const getPlaybackId = (url) => {  
  const fileMatch = url.match(/\/([^/]+)\.([a-zA-Z0-9]+)$/);
  return fileMatch ? fileMatch[1] : null; 
}

const VideoMUXPlayer = ({title, namespace, videoSrc, streamType, tokens, isSecure, ...muxOptions}) => {  

  const playerRef = useRef(null);

  useEffect(() => {
    console.log('MUX new tokens comming...')
  }, [tokens])

  useEffect(() => {
    console.log('new src: ', videoSrc);
  }, [videoSrc]);

  if(isSecure && !tokens?.playback_token) {
    return (<div>
      Loading...
    </div>)
  }

  return (
    <MuxPlayer
      ref={playerRef}
      streamType={streamType}
      envKey={getEnvVariable(MUX_ENV_KEY)}
      playbackId={getPlaybackId(videoSrc)}      
      tokens={{
        playback: tokens?.playback_token,
        thumbnail: tokens?.thumbnail_token,
        storyboard: tokens?.storyboard_token,
      }}
      metadata={{
        video_title: {title},
        sub_property_id: {namespace},
        // video_id: "video-id-54321",
        // viewer_user_id: "user-id-007",
      }}
      {...muxOptions}
    />
  );
}

export default VideoMUXPlayer;

// class VideoJSPlayer extends React.Component {
//   componentDidMount() {
//     const { title, namespace, firstHalf, start } = this.props;

//     let plugins = {}

//     if (getEnvVariable(MUX_ENV_KEY)) {
//       plugins = { ...plugins,
//         mux: {
//           debug: false,
//           data: {
//             env_key: getEnvVariable(MUX_ENV_KEY),
//             video_title: title,
//             sub_property_id: namespace,
//             /* Metadata
//             player_init_time: playerInitTime*/
//           }
//         }
//       }
//     }

//     const options = {
//       html5: {
//         vhs: {
//           overrideNative: !videojs.browser.IS_SAFARI,
//         },
//       },
//       plugins: plugins,
//       ...this.props,
//     };

//     const onPlayerReady = () => {          
//       const src = this.player.src();
//       if (start) this.player.currentTime(start);
//       let reloadPlayer = null;
//       let modal = null;
//       let isLive = null;

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

//       this.player.on('playing', () => {        
//         if (reloadPlayer) clearInterval(reloadPlayer);
//         if (modal) modal.dispose();                
//         if (this.player.duration() === Infinity) {
//           isLive = true;
//         };
//       });

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

//     this.player = videojs(this.videoNode, options, onPlayerReady);
//   }

//   componentWillUnmount() {
//     if (this.player) {
//       this.player.dispose();
//     }
//   }

//   componentWillReceiveProps(nextProps) {
//     if (nextProps.sources !== this.props.sources) {
//       this.player.src(nextProps.sources);
//       this.player.poster(nextProps.poster);
//     }
//   }
//   render() {
//     return (
//       <div>
//         <div data-vjs-player>
//           {/* eslint-disable jsx-a11y/media-has-caption */}
//           <video
//             ref={node => (this.videoNode = node)}
//             className="video-js vjs-big-play-centered"
//             playsInline={this.props.playsInline}
//           />
//         </div>
//       </div>
//     );
//   }
// }

// export default VideoJSPlayer;