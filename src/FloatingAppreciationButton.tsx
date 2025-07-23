import React, { useState, useRef, useEffect } from 'react';

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

const adContainerStyle: React.CSSProperties = {
  minWidth: '320px',
  minHeight: '100px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

function loadAdSenseScript(client: string): Promise<void> {
  return new Promise((resolve, reject) => {
    // Check for existing AdSense script by src
    if (document.querySelector('script[src^="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]')) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${client}`;
    script.crossOrigin = 'anonymous';
    // No custom attribute
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load AdSense script'));
    document.head.appendChild(script);
  });
}

// Mobile detection helper
function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  return /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

const FloatingAppreciationButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const ADSENSE_CLIENT = 'ca-pub-9644041666041710';
  const ADSENSE_SLOT = '9237413880';

  useEffect(() => {
    if (showModal) {
      setAdFailed(false);
      loadAdSenseScript(ADSENSE_CLIENT)
        .then(() => {
          if (adRef.current) {
            adRef.current.innerHTML = '';
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            ins.style.width = '320px';
            ins.style.height = '100px';
            ins.setAttribute('data-ad-client', ADSENSE_CLIENT);
            ins.setAttribute('data-ad-slot', ADSENSE_SLOT);
            adRef.current.appendChild(ins);
            // Trigger AdSense
            // @ts-ignore
            if (window.adsbygoogle && Array.isArray(window.adsbygoogle)) {
              // @ts-ignore
              window.adsbygoogle.push({});
            }
          }
          // Start timer to check if ad loads
          timerRef.current = setTimeout(() => {
            if (adRef.current) {
              const ins = adRef.current.querySelector('ins.adsbygoogle');
              if (!ins || ins.childNodes.length === 0) {
                console.warn('AdSense: No fill (ad slot empty after timeout)');
                setAdFailed(true);
              } else {
                console.log('AdSense: Ad successfully loaded (ad slot filled)');
              }
            }
          }, 1500);
        })
        .catch((err) => {
          console.error('Failed to load AdSense script:', err);
          setAdFailed(true);
        });
    }
    // Cleanup timer on close
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showModal]);

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
      <button style={floatingButtonStyle} onClick={() => setShowModal(true)}>
        I Appreciate You!
      </button>
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <button style={closeButtonStyle} onClick={() => setShowModal(false)} aria-label="Close modal">×</button>
            {adFailed ? (
              <img src="/wipeout.png" alt="Ad failed to load" style={{ width: 320, height: 100, objectFit: 'contain', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }} />
            ) : (
              <div style={adContainerStyle} ref={adRef} />
            )}
            <p style={{ marginTop: 24, color: '#888', fontSize: '0.95rem' }}>Thank you for supporting us!</p>
          </div>
        </div>
      )}
    </>
  );
};

export default FloatingAppreciationButton; 