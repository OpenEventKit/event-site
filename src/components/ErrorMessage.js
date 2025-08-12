import React from "react";
import { Container, Box, Typography } from "@mui/material";

const ErrorMessage = ({ title, message, fullScreen = false }) => {
  const containerStyles = fullScreen 
    ? { height: "100vh", display: "flex", justifyContent: "center", alignItems: "center" }
    : {};

  return (
    <Container maxWidth={false} style={containerStyles}>
      <Box display="flex" justifyContent="center" alignItems="center" height={fullScreen ? "auto" : "100vh"}>
        <Box textAlign="center" padding={4}>
          <Typography variant="h3" component="h1" gutterBottom style={{ fontWeight: "bold", color: "#333" }}>
            {title}
          </Typography>
          <Typography variant="h4" component="p" style={{ color: "#666", lineHeight: 1.6, whiteSpace: "pre-line" }}>
            {message}
          </Typography>
        </Box>
      </Box>
    </Container>
  );
};

export default ErrorMessage;