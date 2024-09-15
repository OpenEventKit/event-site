import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { getOverflowEventByKey } from "../../actions/event-actions";
import { Container, Box, CircularProgress, Alert, Typography } from "@mui/material";
import VideoComponent from "../../components/VideoComponent";

const OverflowPlayerPage = ({
  location,
  fetchOverflowEvent,
  loading,
  event,
  tokens,
  error
}) => {
  const params = new URLSearchParams(location.search);
  const overflowStreamKey = params.get("k");

  useEffect(() => {
    if (overflowStreamKey) {
      fetchOverflowEvent(overflowStreamKey);
    }
  }, [overflowStreamKey, fetchOverflowEvent]);

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
    <Container maxWidth={false}>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          <CircularProgress color="secondary" />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
          {event && (
            <Box>
              <Typography variant="h4" component="h1" gutterBottom>
                {event.title}
              </Typography>
              <VideoComponent
                url={event.overflow_streamming_url}
                title={event.title}
                isLive={true}
                autoPlay={true}
                tokens={tokens}
                onError={(e) => console.error("Video error:", e)}
              />
            </Box>
          )}
        </Box>
      )}
    </Container>
  );
};

const mapStateToProps = ({ eventState }) => ({
  loading: eventState.loading,
  event: eventState.event,
  tokens: eventState.tokens,
  error: eventState.error
});

const mapDispatchToProps = (dispatch) => ({
  fetchOverflowEvent: (streamKey) => dispatch(getOverflowEventByKey(streamKey))
});

export default connect(mapStateToProps, mapDispatchToProps)(OverflowPlayerPage);
