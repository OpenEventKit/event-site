import React from "react";
import { Document, Page, Text, View, Image, StyleSheet, pdf } from "@react-pdf/renderer";

import {
  getRegisteredFontFamily,
  registerCustomFont
} from "../../utils/pdfFonts";
import { USER_ROLES } from './constants';


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

// Validate image URL before PDF generation
const validateImageUrl = async (url) => {
  if (!url) return null;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      mode: 'cors'
    });
    
    if (response.ok) {
      return url;
    }
    return null;
  } catch (error) {
    console.warn("Image validation failed:", error);
    return null;
  }
};

const CertificatePDF = ({ 
  attendee, 
  summit, 
  settings, 
  isCheckedIn = true,
  logoUrl = null
}) => {
  const role = attendee.role || "Attendee";
  const isSpeaker = role === USER_ROLES.SPEAKER;
  const position = attendee.jobTitle || "";
  const company = attendee.company || "";

  const fullName = `${attendee.firstName} ${attendee.lastName}`;

  const nameFontSize = calculateOptimalFontSize(fullName);


  // Use fonts registered at app init, or try custom font from site settings
  let fontFamily = getRegisteredFontFamily();

  // If site settings has a custom font, try to register it (may already be registered at init)
  if (settings?.siteFont && settings.siteFont.fontFamily) {
    const customFontRegistered = registerCustomFont(settings.siteFont);
    if (customFontRegistered) {
      fontFamily = settings.siteFont.fontFamily;
    }
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
      maxHeight: settings.logoHeight || 150,
      marginBottom: 25,
      objectFit: "contain",
    },
    title: {
      fontSize: 20,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.15,
      lineHeight: "160%",
      marginBottom: 5,
    },
    summitName: {
      fontSize: 24,
      fontWeight: "bold",
      color: settings.mainColor || settings.colorAccent || "#ff5e32",
      textAlign: "center",
      textTransform: "uppercase",
      letterSpacing: 0,
      lineHeight: "133%",
    },
    summitDate: {
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.15,
      lineHeight: "150%",
      marginTop: 8,
    },
    name: {
      fontSize: nameFontSize,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0,
      lineHeight: "117%",
      marginTop: 36,
    },
    nameUnderline: {
      width: 500,
      height: 1.2,
      backgroundColor: "#000000",
      marginTop: 8,
      marginBottom: 20,
    },
    details: {
      fontSize: 14,
      fontWeight: "normal",
      color: "#000000",
      textAlign: "center",
      letterSpacing: 0.4,
      lineHeight: "166%",
    },
    role: {
      fontSize: 14,
      fontWeight: "normal",
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
            {logoUrl && (
              <Image 
                src={logoUrl} 
                style={styles.logo}
                debug={false} // When true, shows a visible error placeholder if image fails to load
              />
            )}
            
            {/* Title */}
            <Text style={styles.title}>
              {isSpeaker && settings.speakerTitleText ? 
                settings.speakerTitleText :
                !isSpeaker && settings.attendeeTitleText ?
                  settings.attendeeTitleText :
                  settings.titleText || (isSpeaker ? "CERTIFICATE OF APPRECIATION" : "CERTIFICATE OF ATTENDANCE")}
            </Text>
            
            {/* Event Name */}
            <Text style={styles.summitName}>
              {settings.summitName || summit.name || "EVENT NAME"}
            </Text>
            
            {/* Summit Date */}
            {summit.dates_label && (
              <Text style={styles.summitDate}>
                {summit.dates_label}
              </Text>
            )}
            
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
export const generatePDF = async (attendee, summit, settings) => {
  try {
    // Validate logo URL before generating PDF
    const logoUrlToValidate = settings.logo || summit.logo;
    const validatedLogoUrl = await validateImageUrl(logoUrlToValidate);
    
    const doc = <CertificatePDF 
      attendee={attendee} 
      summit={summit} 
      settings={settings}
      logoUrl={validatedLogoUrl}
    />;
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

