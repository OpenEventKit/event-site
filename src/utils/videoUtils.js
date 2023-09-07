const IS_MUX_VIDEO_REGEX = /https:\/\/stream.mux.com\/(.*).m3u8/;

export const getMUXPlaybackId = (url) => {
    const fileMatch = url.match(IS_MUX_VIDEO_REGEX);
    return fileMatch ? fileMatch[1] : null;
}

export const checkMuxTokens = (tokens) => {
    return tokens && tokens.playback_token && tokens.thumbnail_token && tokens.storyboard_token;
}

export const isVimeoVideo = (url) => {
    // this is get from vimeo dash board
    return url.match(/https:\/\/(www\.)?(player\.)?vimeo.com\/(.*)/);
};

export const isYouTubeVideo = (url) => {
    return url.match(/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
}

export const isMuxVideo = (url) => {
    return url.match(IS_MUX_VIDEO_REGEX)
}
