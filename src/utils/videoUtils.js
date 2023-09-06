export const getMUXPlaybackId = (url) => {
    const fileMatch = url.match(/\/([^/]+)\.([a-zA-Z0-9]+)$/);
    return fileMatch ? fileMatch[1] : null;
}

export const checkMuxTokens = (tokens) => {
    console.log('utils check tokens...', tokens && tokens.playback_token && tokens.thumbnail_token && tokens.storyboard_token);
    return tokens && tokens.playback_token && tokens.thumbnail_token && tokens.storyboard_token;
}

export const isLiveVideo = (url) => {
    let isLiveVideo = null;
    url.match(/.m3u8/) ? isLiveVideo = true : isLiveVideo = false;
    return isLiveVideo;
};

export const isVimeoVideo = (url) => {
    // this is get from vimeo dash board
    return url.match(/https:\/\/(www\.)?(player\.)?vimeo.com\/(.*)/);
};

export const isYouTubeVideo = (url) => {
    return url.match(/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
}

export const isMuxVideo = (url) => {
    return url.match(/^https:\/\/[^/]*\.mux\.com\//i)
}
