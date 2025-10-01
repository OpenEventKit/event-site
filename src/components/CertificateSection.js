import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { generateCertificatePDF } from './CertificatePDF';
import { useCertificateSettings } from '../utils/certificateSettings';
import useMarketingSettings from '../utils/useMarketingSettings';
import { MARKETING_SETTINGS_KEYS, DISPLAY_OPTIONS } from '../utils/useMarketingSettings';
import useSiteSettings from '../utils/useSiteSettings';
import styles from '../styles/full-profile.module.scss';

const USER_ROLES = {
  SPEAKER: 'Speaker',
  ATTENDEE: 'Attendee'
};

const CertificateSection = ({ 
  user, 
  summit, 
  freshTickets = []
}) => {
  const [error, setError] = useState(null);
  const { getSettingByKey } = useMarketingSettings();
  const siteSettings = useSiteSettings();

  // Get certificate settings
  const certificateSettings = useCertificateSettings(siteSettings?.siteFont);
  
  // Check if certificates are enabled
  const certificatesEnabled = getSettingByKey(MARKETING_SETTINGS_KEYS.certificateEnabled) !== DISPLAY_OPTIONS.hide;
  
  if (!certificatesEnabled) {
    return null;
  }

  // Filter tickets that are checked in
  const checkedInTickets = freshTickets.filter(ticket => {
    const isCheckedIn = ticket.owner?.summit_hall_checked_in === true;
    const isValidTicket = 
      ticket.status !== 'Cancelled' &&
      ticket.status !== 'RefundRequested' &&
      ticket.owner !== null;
    
    return isCheckedIn && isValidTicket;
  });

  if (checkedInTickets.length === 0) {
    return (
      <div>
        <h3 className={styles.header}>Certificate of Attendance</h3>
        <div style={{ padding: '15px 0', color: '#666' }}>
          Check-in required to download certificate.
        </div>
      </div>
    );
  }

  // Get user role from tickets/badges - prioritize Speaker role across all tickets
  const getUserRole = (allTickets) => {
    // Check if any ticket has speaker role
    const hasSpeakerTicket = allTickets.some(ticket => {
      // Check badge type name for speaker
      const badgeType = summit?.badge_types?.find(bt => bt.id === ticket.badge?.type_id);
      if (badgeType?.name?.toLowerCase().includes('speaker')) {
        return true;
      }
      
      // Check badge features for speaker
      const featureIds = ticket.badge?.features || [];
      const badgeFeaturesTypes = summit?.badge_features_types || [];
      
      return featureIds.some(featureId => {
        const feature = badgeFeaturesTypes.find(f => f.id === featureId);
        return feature?.name?.toLowerCase().includes('speaker');
      });
    });
    
    return hasSpeakerTicket ? USER_ROLES.SPEAKER : USER_ROLES.ATTENDEE;
  };

  // Determine the user's role across all tickets (prioritize Speaker)
  const userRole = getUserRole(checkedInTickets);

  const handleDownloadCertificate = async (ticket) => {
    setError(null);
    
    try {
      const attendeeData = {
        firstName: user.first_name || user.given_name || ticket.owner?.first_name,
        lastName: user.last_name || user.family_name || ticket.owner?.last_name,
        company: user.company || ticket.owner?.company || '',
        jobTitle: user.job_title || user.jobTitle || '',
        email: user.email || ticket.owner?.email,
        role: userRole // Use the prioritized role across all tickets
      };

      const summitData = {
        name: summit.name,
        logo: summit.logo,
        dates_label: summit.dates_label
      };

      await generateCertificatePDF(attendeeData, summitData, certificateSettings);
    } catch (err) {
      console.error('Error downloading certificate:', err);
      setError('Failed to download certificate. Please try again.');
    }
  };

  return (
    <>
      <div style={{ marginTop: '20px' }}>
        <button 
          className={`button is-large ${styles.certificateButton}`}
          onClick={() => handleDownloadCertificate(checkedInTickets[0])}
          style={{ 
            width: '100%', 
            height: '5.5rem',
            color: 'var(--color_input_text_color)',
            backgroundColor: 'var(--color_input_background_color)',
            borderColor: 'var(--color_input_border_color)'
          }}
        >
          Download Certificate of Attendance
        </button>
        
        {error && (
          <div style={{ color: '#d32f2f', fontSize: '14px', marginTop: '10px' }}>
            {error}
          </div>
        )}
      </div>
    </>
  );
};

const mapStateToProps = ({ summitState, userState }) => ({
  summit: summitState.summit,
  user: userState.userProfile || userState.idpProfile
});

export default connect(mapStateToProps)(CertificateSection);