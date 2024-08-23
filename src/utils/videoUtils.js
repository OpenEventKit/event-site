const IS_MUX_VIDEO_REGEX = /https:\/\/stream.mux.com\/(.*).m3u8/;
const IS_SYNC_WORDS_VIDEO_REGEX = /https:\/\/player.syncwords.com\/iframe\/live\/(.*)\/(.*)/g;

export const getMUXPlaybackId = (url) => {
    if(!url) return null;
    const fileMatch = url.match(IS_MUX_VIDEO_REGEX);
    return fileMatch ? fileMatch[1] : null;
}

export const checkMuxTokens = (tokens) => {
    return tokens && tokens.playback_token && tokens.thumbnail_token && tokens.storyboard_token;
}

export const isVimeoVideo = (url) => {
    if(!url) return false;
    // this is get from vimeo dash board
    return url.match(/https:\/\/(www\.)?(player\.)?vimeo.com\/(.*)/);
};

export const isYouTubeVideo = (url) => {
    if(!url) return false;
    return url.match(/^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/);
}

export const isMuxVideo = (url) => {
    if(!url) return false;
    return url.match(IS_MUX_VIDEO_REGEX)
}

export const isSynchWordsVideo = (url) => {
    if(!url) return false;
    return url.match(IS_SYNC_WORDS_VIDEO_REGEX);
}

/**
 * @param src
 * @returns {string|null}
 */
export const getSynchWordsVideoFrameDdFromSrc = (src) => {
    const m = [...src.matchAll(IS_SYNC_WORDS_VIDEO_REGEX)];
    if(!m?.length) return null;
    const parts = m[0];
    if(parts.length < 3) return null;
    return `${parts[1]}-live-${parts[2]}`;
}
