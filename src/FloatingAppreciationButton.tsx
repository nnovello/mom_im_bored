import React, { useState, useRef, useEffect } from 'react';
import { TipForm } from './App';
import { trackFacebookEvent } from './services/analytics';

const buttonStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: '32px',
  right: '32px',
  zIndex: 1000,
  padding: '16px 24px',
  backgroundColor: '#ffb347',
  color: '#fff',
  border: 'none',
  borderRadius: '24px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  fontSize: '1.1rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.2s',
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100vw',
  height: '100vh',
  background: 'rgba(0,0,0,0.5)',
  zIndex: 2000,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const modalContentStyle: React.CSSProperties = {
  background: '#fff',
  borderRadius: '16px',
  padding: '32px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
  maxWidth: '90vw',
  maxHeight: '90vh',
  position: 'relative',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const closeButtonStyle: React.CSSProperties = {
  position: 'absolute',
  top: '16px',
  right: '16px',
  background: 'transparent',
  border: 'none',
  fontSize: '1.5rem',
  cursor: 'pointer',
  color: '#333',
};

// Mobile detection helper
function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const FloatingAppreciationButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  // Removed adFailed, adRef, timerRef, ADSENSE_CLIENT, ADSENSE_SLOT

  // Removed useEffect for AdSense

  // Determine button style based on device
  const mobile = isMobileDevice();
  const floatingButtonStyle = mobile
    ? {
        position: 'fixed',
        top: '8px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        padding: '16px 24px',
        backgroundColor: '#ffb347',
        color: '#fff',
        border: 'none',
        borderRadius: '24px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '1.1rem',
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'background 0.2s',
      } as React.CSSProperties
    : buttonStyle;

  return (
    <>
      <button style={floatingButtonStyle} onClick={() => {
        setShowModal(true);
        // Track Lead event when user clicks "I Appreciate You" button
        trackFacebookEvent('Lead', {
          content_name: 'I Appreciate You Button',
          content_category: 'Appreciation',
          value: 1,
          currency: 'USD'
        });
      }}>
        I Appreciate You!
      </button>
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <button style={closeButtonStyle} onClick={() => setShowModal(false)} aria-label="Close modal">×</button>
            {/* Removed AdSense and wipeout.png logic */}
            <p style={{ marginTop: 24, color: '#888', fontSize: '1.05rem' }}>I Appreciate Your Support!</p>
            <TipForm onSuccess={() => {/* Optionally close modal or show a thank you */}} />
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAppreciationButton; 