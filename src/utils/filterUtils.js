export const filterByTrackGroup = (originalEvents, currentTrackGroupId = 0) => {
    if (currentTrackGroupId === 0) return originalEvents;
    return originalEvents.filter((ev) => {
        return ev?.track?.track_groups.includes(currentTrackGroupId);
    });
}

export const randomSort = (array) => {
    return array.map((a) => [Math.random(),a]).sort((a,b) => a[0]-b[0]).map((a) => a[1]);
}