import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, Font, pdf } from "@react-pdf/renderer";

import fontRegular from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-400.ttf";
import fontBold from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-700.ttf";
import fontItalic from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-400italic.ttf";
import font500 from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-500.ttf";
import font800 from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-800.ttf";
import font900 from "../../static/fonts/nunito-sans/nunito-sans-v18-latin-900.ttf";

const registerDefaultFont = () => {
  try {
    Font.register({
      family: "Nunito Sans", 
      fonts: [
        {
          src: fontRegular,
          fontWeight: "normal"
        },
        {
          src: fontBold,
          fontWeight: "bold"
        },
        {
          src: fontItalic,
          fontWeight: "normal",
          fontStyle: "italic"
        },
        {
          src: font500,
          fontWeight: 500
        },
        {
          src: font800,
          fontWeight: 800
        },
        {
          src: font900,
          fontWeight: 900
        }
      ]
    });
    return true;
  } catch (error) {
    console.error("Failed to register default font:", error);
    return false;
  }
};

// helper to convert relative font paths to absolute URLs
const getFontUrl = (fontPath) => {
  if (!fontPath) return null;
  
  if (fontPath.startsWith("http://") || fontPath.startsWith("https://")) {
    return fontPath;
  }

  // For relative paths, prepend the origin
  // Site settings fonts are served from /fonts/ (not /static/fonts/)
  if (typeof window !== "undefined") {
    // Remove /static prefix if present since fonts are served at root /fonts/
    const cleanPath = fontPath.replace("/static/fonts/", "/fonts/");
    return `${window.location.origin}${cleanPath}`;
  }
  
  return fontPath;
};

// register custom font from site settings if available
const registerCustomFont = (siteFont) => {
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
      return true;
    } catch (error) {
      console.warn("Failed to register custom font:", error);
      return false;
    }
  }
  
  return false;
};

const calculateOptimalFontSize = (text, maxWidth = 650, initialFontSize = 48, minFontSize = 24) => {
  // estimate average character width based on font size
  // for most fonts, character width is roughly 0.5-0.6 times the font size
  const avgCharWidthRatio = 0.55;
  
  // start with initial font size
  let fontSize = initialFontSize;
  
  // calculate the approximate text width
  const estimatedWidth = text.length * fontSize * avgCharWidthRatio;
  
  // if text fits within maxWidth, use initial font size
  if (estimatedWidth <= maxWidth) {
    return fontSize;
  }
  
  // calculate optimal font size to fit within maxWidth
  fontSize = Math.floor(maxWidth / (text.length * avgCharWidthRatio));
  
  // ensure font size is within bounds
  fontSize = Math.max(minFontSize, Math.min(initialFontSize, fontSize));
  
  // round to common font sizes for better appearance
  const commonSizes = [48, 44, 40, 36, 32, 28, 24];
  const finalSize = commonSizes.find(size => size <= fontSize) || minFontSize;
  
  return finalSize;
};

const CertificatePDF = ({ 
  attendee, 
  summit, 
  settings, 
  isCheckedIn = true 
}) => {

  const role = attendee.role || "Attendee";
  const position = attendee.jobTitle || "";
  const company = attendee.company || "";

  const fullName = `${attendee.firstName} ${attendee.lastName}`;

  const nameFontSize = calculateOptimalFontSize(fullName);


  let fontFamily = "Nunito Sans";

  if (settings?.siteFont && settings.siteFont.fontFamily) {
    const customFontRegistered = registerCustomFont(settings.siteFont);
    if (customFontRegistered) {
      fontFamily = settings.siteFont.fontFamily;
    } else {
      registerDefaultFont();
    }
  } else {
    registerDefaultFont();
  }

  const styles = StyleSheet.create({
    page: {
      width: settings.width || "11in",
      height: settings.height || "8.5in",
      backgroundColor: settings.mainColor || settings.colorAccent || "#ff5e32",
      fontFamily: fontFamily,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: 40,
    },
    whiteCard: {
      width: "100%",
      maxWidth: 680,
      height: "100%",
      maxHeight: 502,
      backgroundColor: "#ffffff",
      borderRadius: 4,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },
    content: {
      position: "relative",
      width: "100%",
      height: "100%",
      padding: 60,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    logo: {
      maxWidth: settings.logoWidth || 250,
      ...(settings.logoHeight && { maxHeight: settings.logoHeight }),
      marginBottom: 25,
      objectFit: "contain",
    },
    title: {
      fontSize: 20,
      fontWeight: 500,
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.15,
      lineHeight: "160%",
      marginBottom: 8,
    },
    summitName: {
      fontSize: 24,
      fontWeight: 400,
      color: settings.mainColor || settings.colorAccent || "#ff5e32",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0,
      lineHeight: "133%",
      marginBottom: 36,
    },
    name: {
      fontSize: nameFontSize,
      fontWeight: 400,
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: "117%",
      marginBottom: 0,
    },
    nameUnderline: {
      width: 450,
      height: 1.2,
      backgroundColor: "#000000",
      marginTop: 8,
      marginBottom: 20,
    },
    details: {
      fontSize: 14,
      fontWeight: 400,
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.4,
      lineHeight: "166%",
    },
    role: {
      fontSize: 14,
      fontWeight: 400,
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.4,
      lineHeight: "166%",
      marginTop: 6,
    },
  });

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* White Card Container */}
        <View style={styles.whiteCard}>
          <View style={styles.content}>
            {/* Logo */}
            {(settings.logo || summit.logo) && (
              <Image 
                src={settings.logo || summit.logo} 
                style={styles.logo} 
              />
            )}
            
            {/* Title */}
            <Text style={styles.title}>
              {settings.titleText || "CERTIFICATE OF ATTENDANCE"}
            </Text>
            
            {/* Event Name */}
            <Text style={styles.summitName}>
              {settings.summitName || summit.name || "EVENT NAME"}
            </Text>
            
            {/* Attendee Name */}
            <Text style={styles.name}>
              {fullName}
            </Text>
            
            {/* Underline */}
            <View style={styles.nameUnderline} />
            
            {/* Position and Company */}
            {(position || company) && (
              <Text style={styles.details}>
                {position}{position && company ? ", " : ""}{company}
              </Text>
            )}
            
            {/* Role */}
            {settings.showRole && (
              <Text style={styles.role}>
                {role}
              </Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};

// helper function to generate and download the certificate
export const generateCertificatePDF = async (attendee, summit, settings) => {
  try {
    const doc = <CertificatePDF attendee={attendee} summit={summit} settings={settings} />;
    const blob = await pdf(doc).toBlob();
    
    // create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `certificate-${attendee.firstName}-${attendee.lastName}.pdf`.toLowerCase().replace(/\s+/g, "-");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating certificate PDF:", error);
    throw error;
  }
};

export default CertificatePDF;
