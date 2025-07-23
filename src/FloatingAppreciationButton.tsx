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

const FloatingAppreciationButton: React.FC = () => {
  const [showModal, setShowModal] = useState(false);
  const [adFailed, setAdFailed] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (showModal) {
      setAdFailed(false);
      if (adRef.current) {
        adRef.current.innerHTML = '';
        const ins = document.createElement('ins');
        ins.className = 'adsbygoogle';
        ins.style.display = 'block';
        ins.style.width = '320px';
        ins.style.height = '100px';
        ins.setAttribute('data-ad-client', 'ca-pub-9644041666041710');
        ins.setAttribute('data-ad-slot', '9237413880');
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
        // If the ad container is still empty or ins has no children, consider it failed
        if (adRef.current) {
          const ins = adRef.current.querySelector('ins.adsbygoogle');
          // If ins has no child nodes or is still empty
          if (!ins || ins.childNodes.length === 0) {
            setAdFailed(true);
          }
        }
      }, 1500);
    }
    // Cleanup timer on close
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [showModal]);

  return (
    <>
      <button style={buttonStyle} onClick={() => setShowModal(true)}>
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