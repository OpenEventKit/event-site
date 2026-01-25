/**
 * Shared PDF font registration utility
 * Used by certificate and receipt PDF generation
 *
 * Font.register() is a global static method in @react-pdf/renderer
 * Once registered, fonts are available to all PDFs in the application
 */
import { Font } from "@react-pdf/renderer";

// Default font family name
export const DEFAULT_FONT_FAMILY = "Nunito Sans";

// Default font file path (relative to static folder, served at /fonts/)
export const DEFAULT_FONT_PATH = "/fonts/nunito-sans/NunitoSans-Variable.ttf";

// Track if fonts have been registered
let fontsRegistered = false;
let registeredFontFamily = DEFAULT_FONT_FAMILY;

/**
 * Register the default Nunito Sans font
 * @param {string} fontFile - Path to the font file
 * @returns {boolean} - Whether registration was successful
 */
export const registerDefaultFont = (fontFile) => {
  if (!fontFile) {
    console.warn("No font file provided for default font registration");
    return false;
  }

  try {
    Font.register({
      family: DEFAULT_FONT_FAMILY,
      fonts: [
        {
          src: fontFile,
          fontWeight: "normal"
        },
        {
          src: fontFile,
          fontWeight: "bold"
        },
      ]
    });
    registeredFontFamily = DEFAULT_FONT_FAMILY;
    return true;
  } catch (error) {
    console.error("Failed to register default font:", error);
    return false;
  }
};

/**
 * Convert font paths to consistent format
 * Returns relative paths to avoid SSR/client hydration mismatch
 * @param {string} fontPath - The font path (relative or absolute)
 * @returns {string|null} - The cleaned path or null
 */
export const getFontUrl = (fontPath) => {
  if (!fontPath) return null;

  // Already an absolute URL - return as-is
  if (fontPath.startsWith("http://") || fontPath.startsWith("https://")) {
    return fontPath;
  }

  // Clean up the path - remove /static prefix since fonts are served at root /fonts/
  // Always return relative path to avoid SSR/client hydration mismatch
  return fontPath.replace("/static/fonts/", "/fonts/");
};

/**
 * Register custom font from site settings
 * @param {Object} siteFont - Site font configuration
 * @param {string} siteFont.fontFamily - Font family name
 * @param {Object} siteFont.regularFont - Regular font config
 * @param {Object} siteFont.boldFont - Bold font config
 * @returns {boolean} - Whether registration was successful
 */
export const registerCustomFont = (siteFont) => {
  if (!siteFont || !siteFont.fontFamily || !siteFont.regularFont || !siteFont.boldFont) {
    return false;
  }

  const fonts = [];

  if (siteFont.regularFont.fontFile && siteFont.regularFont.fontFormat === "ttf") {
    const fontUrl = getFontUrl(siteFont.regularFont.fontFile);
    if (fontUrl) {
      fonts.push({
        src: fontUrl,
        fontWeight: "normal"
      });
    }
  }

  if (siteFont.boldFont.fontFile && siteFont.boldFont.fontFormat === "ttf") {
    const fontUrl = getFontUrl(siteFont.boldFont.fontFile);
    if (fontUrl) {
      fonts.push({
        src: fontUrl,
        fontWeight: "bold"
      });
    }
  }

  if (fonts.length > 0) {
    try {
      Font.register({
        family: siteFont.fontFamily,
        fonts: fonts
      });
      registeredFontFamily = siteFont.fontFamily;
      return true;
    } catch (error) {
      console.warn("Failed to register custom font:", error);
      return false;
    }
  }

  return false;
};

/**
 * Initialize PDF fonts - call this at app startup
 * @param {Object} options - Font options
 * @param {string} options.defaultFontFile - Path to default font file
 * @param {Object} options.siteFont - Custom site font config (optional)
 * @returns {string} - The registered font family name
 */
export const initializePdfFonts = ({ defaultFontFile, siteFont = null }) => {
  if (fontsRegistered) {
    return registeredFontFamily;
  }

  // Try custom font first if available
  if (siteFont) {
    const customFontRegistered = registerCustomFont(siteFont);
    if (customFontRegistered) {
      fontsRegistered = true;
      return registeredFontFamily;
    }
  }

  // Fall back to default font
  if (defaultFontFile) {
    const defaultRegistered = registerDefaultFont(defaultFontFile);
    if (defaultRegistered) {
      fontsRegistered = true;
      return registeredFontFamily;
    }
  }

  // If all else fails, return Helvetica (built-in)
  registeredFontFamily = "Helvetica";
  fontsRegistered = true;
  return registeredFontFamily;
};

/**
 * Get the currently registered font family
 * @returns {string} - The registered font family name
 */
export const getRegisteredFontFamily = () => {
  return registeredFontFamily;
};

/**
 * Check if fonts have been registered
 * @returns {boolean}
 */
export const areFontsRegistered = () => {
  return fontsRegistered;
};
