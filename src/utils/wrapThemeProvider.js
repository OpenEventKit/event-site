import * as React from "react";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import createEmotionCache from "./createEmotionCache";

import theme from "../styles/theme";

const cache = createEmotionCache();

const wrapThemeProvider = ({ element }) => (
  <CacheProvider value={cache}>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {element}
    </ThemeProvider>
  </CacheProvider>
);

export default wrapThemeProvider;
