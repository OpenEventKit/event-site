import React from 'react';
import PropTypes from 'prop-types';
import {getSynchWordsVideoFrameDdFromSrc} from "../utils/videoUtils";


class SynchWordsPlayer extends React.Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  render() {
    const { video, className, autoplay } = this.props;
    const id = getSynchWordsVideoFrameDdFromSrc(video);
    console.log(`SynchWordsPlayer::render with id ${id}`);
    let allow = "encrypted-media";
    if(autoplay) allow = allow +';autoplay'
    return (
      <div className={className}>
        <iframe id={id}
                src={video}
                frameBorder="0"
                scrolling="no"
                allow={allow}
                allowFullScreen webkitallowfullscreen mozallowfullscreen oallowfullscreen msallowfullscreen
                >
        </iframe>
      </div>
    );
  }
}

SynchWordsPlayer.propTypes = {
    /**
     * a video URL.
     */
    video: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.string,
    ]),
  /**
   * CSS className for the player element.
   */
  className: PropTypes.string,
  /**
   * Automatically start playback of the video. Note that this won’t work on
   * some devices.
   */
  autoplay: PropTypes.bool,
};

export default SynchWordsPlayer;
