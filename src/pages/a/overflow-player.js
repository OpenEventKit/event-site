import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { getOverflowEventByKey } from "../../actions/event-actions";
import { Container, Box, CircularProgress, Alert, Typography, Fade } from "@mui/material";
import VideoComponent from "../../components/VideoComponent";

const OverflowPlayerPage = ({
  location,
  fetchOverflowEvent,
  loading,
  event,
  error
}) => {
  const params = new URLSearchParams(location.search);
  const overflowStreamKey = params.get("k");
  const [showTitleFlash, setShowTitleFlash] = useState(false);
  const [videoError, setVideoError] = useState(false);

  useEffect(() => {
    if (overflowStreamKey) {
      fetchOverflowEvent(overflowStreamKey);
    }
  }, [overflowStreamKey, fetchOverflowEvent]);

  useEffect(() => {
    if (event && !loading && !error) {
      setShowTitleFlash(true);
    }
  }, [event, loading, error]);

  const handleVideoLoad = () => {
    setShowTitleFlash(false);
  };

  const handleVideoError = (e) => {
    console.error("Video error:", e);
    setVideoError(true);
    setShowTitleFlash(false);
  };

  if (!overflowStreamKey) {
    return (
      <Container maxWidth={false}>
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <Alert severity="error">No stream key provided. Please check the URL.</Alert>
        </Box>
      </Container>
    );
  }

  return (
    <>
      {loading || (!event && !error) ? (
        <Container maxWidth={false}>
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <CircularProgress sx={{ color: 'var(--color_accent)' }} />
          </Box>
        </Container>
      ) : error ? (
        <Container maxWidth={false}>
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Box textAlign="center" padding={4}>
              <Typography variant="h3" component="h1" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
                Stream Unavailable
              </Typography>
              <Typography variant="h4" component="p" style={{ color: '#666', lineHeight: 1.6 }}>
                The overflow stream you're looking for is not currently available.
                <br />
                Please check with event staff or try again later.
              </Typography>
            </Box>
          </Box>
        </Container>
      ) : event ? (
        videoError ? (
          <Container maxWidth={false}>
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
              <Box textAlign="center" padding={4}>
                <Typography variant="h3" component="h1" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
                  Stream Unavailable
                </Typography>
                <Typography variant="h4" component="p" style={{ color: '#666', lineHeight: 1.6 }}>
                  The overflow stream you're looking for is not currently available.
                  <br />
                  Please check with event staff or try again later.
                </Typography>
              </Box>
            </Box>
          </Container>
        ) : (
          <Box 
            width="100vw" 
            height="100vh" 
            position="relative"
            sx={{
              '& .video-module--vimeoPlayer--ac603': {
                paddingBottom: '0 !important',
                height: '100vh !important',
                '& iframe': {
                  width: '100vw !important',
                  height: '100vh !important',
                  position: 'absolute',
                  top: 0,
                  left: 0
                }
              }
            }}
          >
            <VideoComponent
              url={event.overflow_streaming_url}
              title={event.title}
              isLive={true}
              autoPlay={true}
              tokens={event.overflow_tokens}
              onLoaded={handleVideoLoad}
              onError={handleVideoError}
            />
            
            <Fade in={showTitleFlash} timeout={500}>
              <Typography 
                variant="h3" 
                component="h1" 
                position="absolute"
                top="50%"
                left="50%"
                sx={{
                  transform: 'translate(-50%, -50%)',
                  color: 'white',
                  fontWeight: 'bold',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  zIndex: 1000,
                  maxWidth: '80%',
                  textAlign: 'center'
                }}
              >
                {event.title}
              </Typography>
            </Fade>
          </Box>
        )
      ) : (
        <Container maxWidth={false}>
          <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
            <Box textAlign="center" padding={4}>
              <Typography variant="h3" component="h1" gutterBottom style={{ fontWeight: 'bold', color: '#333' }}>
                No Stream Available
              </Typography>
              <Typography variant="h4" component="p" style={{ color: '#666' }}>
                No event data found for this overflow stream.
              </Typography>
            </Box>
          </Box>
        </Container>
      )}
    </>
  );
};

const mapStateToProps = ({ eventState }) => ({
  loading: eventState.loading,
  event: eventState.event,
  error: eventState.error
});

const mapDispatchToProps = (dispatch) => ({
  fetchOverflowEvent: (streamKey) => dispatch(getOverflowEventByKey(streamKey))
});

export default connect(mapStateToProps, mapDispatchToProps)(OverflowPlayerPage);
