import React from 'react';
import { Document, Page, Text, View, Image, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import moment from 'moment';


const CertificatePDF = ({ 
  attendee, 
  summit, 
  settings, 
  isCheckedIn = true 
}) => {
  

  // Determine role (Speaker or Attendee)
  const role = attendee.role || 'Attendee';
  
  // Get company and position info
  const position = attendee.jobTitle || 'Attendee';
  const company = attendee.company || '';
  
  // Get the full name
  const fullName = `${attendee.firstName} ${attendee.lastName}`;
  
  // Calculate optimal font size using DOM measurement
  const calculateOptimalFontSize = (text, maxWidth = 500, initialFontSize = 60, minFontSize = 30) => {
    // Create a temporary DOM element for measurement
    const tempElement = document.createElement('span');
    tempElement.style.position = 'absolute';
    tempElement.style.visibility = 'hidden';
    tempElement.style.whiteSpace = 'nowrap';
    tempElement.style.fontFamily = 'Helvetica';
    tempElement.textContent = text;
    
    document.body.appendChild(tempElement);
    
    let fontSize = initialFontSize;
    tempElement.style.fontSize = fontSize + 'px';
    
    // Reduce font size until text fits within maxWidth
    while (tempElement.offsetWidth > maxWidth && fontSize > minFontSize) {
      fontSize -= 2;
      tempElement.style.fontSize = fontSize + 'px';
    }
    
    document.body.removeChild(tempElement);
    return fontSize;
  };
  
  // Only calculate if we're in a browser environment
  const optimalFontSize = typeof document !== 'undefined' 
    ? calculateOptimalFontSize(fullName) 
    : settings.nameFontSize || 60;

  // Border thickness constant
  const BORDER_WIDTH = 35;

  // Create styles dynamically based on settings
  const styles = StyleSheet.create({
    page: {
      backgroundColor: settings.backgroundColor || '#ffffff',
      width: settings.width || '11in',
      height: settings.height || '8.5in',
      position: 'relative',
      fontFamily: settings.fontFamily || 'Helvetica',
    },
    outerBorder: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderWidth: BORDER_WIDTH,
      borderColor: settings.borderColor || settings.eventNameColor || '#5865F2',
      borderStyle: 'solid',
    },
    innerContent: {
      position: 'absolute',
      top: BORDER_WIDTH,
      left: BORDER_WIDTH,
      right: BORDER_WIDTH,
      bottom: BORDER_WIDTH,
      backgroundColor: settings.backgroundColor || '#ffffff',
    },
    backgroundImage: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      top: 0,
      left: 0,
    },
    content: {
      position: 'relative',
      width: '100%',
      height: '100%',
      padding: settings.margin || 60,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: settings.logoWidth || 150,
      height: settings.logoHeight || 80,
      marginBottom: 40,
      objectFit: 'contain',
    },
    title: {
      fontSize: settings.titleFontSize || 32,
      fontFamily: settings.fontFamily || 'Helvetica',
      color: settings.titleColor || '#000000',
      fontWeight: 'bold',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 2,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: settings.subtitleFontSize || 40,
      fontFamily: settings.fontFamily || 'Helvetica',
      color: settings.subtitleColor || '#5865F2',
      textAlign: 'center',
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: 50,
    },
    name: {
      fontSize: optimalFontSize,
      fontFamily: settings.fontFamily || 'Helvetica',
      color: settings.nameColor || '#000000',
      fontWeight: 'normal',
      textAlign: 'center',
      marginBottom: 15,
      width: '100%',
    },
    company: {
      fontSize: settings.companyFontSize || 22,
      fontFamily: settings.fontFamily || 'Helvetica',
      color: settings.companyColor || '#000000',
      textAlign: 'center',
      marginBottom: 5,
    },
    role: {
      fontSize: settings.roleFontSize || 22,
      fontFamily: settings.fontFamily || 'Helvetica',
      color: settings.roleColor || '#000000',
      textAlign: 'center',
      marginBottom: 60,
    },
  });

  return (
    <Document>
      <Page size="LETTER" orientation="landscape" style={styles.page}>
        {/* Background Image */}
        {settings.backgroundImage && (
          <Image src={settings.backgroundImage} style={styles.backgroundImage} />
        )}
        
        {/* Outer Border Frame */}
        <View style={styles.outerBorder} />
        
        {/* Inner White Content Area */}
        <View style={styles.innerContent}>
          <View style={styles.content}>
          {/* Logo */}
          {settings.logo && (
            <Image src={settings.logo} style={styles.logo} />
          )}
          
          {/* Title */}
          <Text style={styles.title}>
            {settings.titleText || 'CERTIFICATE OF ATTENDANCE'}
          </Text>
          
          {/* Event Name as Subtitle */}
          <Text style={styles.subtitle}>
            {settings.subtitleText || summit.name}
          </Text>
          
          {/* Attendee Name */}
          <Text style={styles.name}>
            {attendee.firstName} {attendee.lastName}
          </Text>
          
          {/* Position, Company on same line - show company alone if no position */}
          {(position !== 'Attendee' || company) && (
            <Text style={styles.company}>
              {position !== 'Attendee' ? position : ''}{position !== 'Attendee' && company ? ', ' : ''}{company}
            </Text>
          )}
          
          {/* Role (Speaker/Attendee) */}
          {settings.roleDisplay && (
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

// Helper function to generate and download the certificate
export const generateCertificatePDF = async (attendee, summit, settings) => {
  try {
    const doc = <CertificatePDF attendee={attendee} summit={summit} settings={settings} />;
    const blob = await pdf(doc).toBlob();
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${attendee.firstName}-${attendee.lastName}.pdf`.toLowerCase().replace(/\s+/g, '-');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error generating certificate PDF:', error);
    throw error;
  }
};

export default CertificatePDF;