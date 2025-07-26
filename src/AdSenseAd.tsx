import React, { useEffect, useRef, useId } from 'react';

const AdSenseAd: React.FC = () => {
  const adRef = useRef<HTMLDivElement>(null);
  const uniqueKey = useId(); // ensures a unique key for each mount

  useEffect(() => {
    let errorLogged = false;
    
    // Set up network error detection for AdSense requests
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      const url = args[0];
      if (typeof url === 'string' && url.includes('googlesyndication.com')) {
        console.log('AdSenseAd: Detected AdSense network request to:', url);
        return originalFetch.apply(this, args)
          .then(response => {
            if (!response.ok) {
              console.error('AdSenseAd: Network error for AdSense request:', {
                url,
                status: response.status,
                statusText: response.statusText
              });
            } else {
              console.log('AdSenseAd: AdSense network request successful:', {
                url,
                status: response.status
              });
            }
            return response;
          })
          .catch(error => {
            console.error('AdSenseAd: Network error for AdSense request:', {
              url,
              error: error.message
            });
            throw error;
          });
      }
      return originalFetch.apply(this, args);
    };
    
    // Set up MutationObserver to watch for changes to the ad slot
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IFRAME') {
                console.log('AdSenseAd: Ad iframe detected:', {
                  src: element.getAttribute('src'),
                  width: element.getAttribute('width'),
                  height: element.getAttribute('height')
                });
                // Remove debug borders if present
                (element as HTMLElement).style.border = '';
                (element as HTMLElement).style.outline = '';
                
                // Check if iframe is visible
                setTimeout(() => {
                  const rect = element.getBoundingClientRect();
                  const computedStyle = window.getComputedStyle(element);
                  console.log('AdSenseAd: Iframe visibility check:', {
                    rect: {
                      top: rect.top,
                      left: rect.left,
                      width: rect.width,
                      height: rect.height
                    },
                    display: computedStyle.display,
                    visibility: computedStyle.visibility,
                    opacity: computedStyle.opacity,
                    position: computedStyle.position,
                    zIndex: computedStyle.zIndex
                  });
                  
                  // Check if iframe is in viewport
                  const isInViewport = rect.top >= 0 && rect.left >= 0 && 
                                     rect.bottom <= window.innerHeight && 
                                     rect.right <= window.innerWidth;
                  console.log('AdSenseAd: Iframe in viewport:', isInViewport);
                  
                  // Check parent elements
                  let parent = element.parentElement;
                  let level = 0;
                  while (parent && level < 5) {
                    const parentRect = parent.getBoundingClientRect();
                    const parentStyle = window.getComputedStyle(parent);
                    console.log(`AdSenseAd: Parent level ${level}:`, {
                      tagName: parent.tagName,
                      className: parent.className,
                      rect: {
                        top: parentRect.top,
                        left: parentRect.left,
                        width: parentRect.width,
                        height: parentRect.height
                      },
                      display: parentStyle.display,
                      visibility: parentStyle.visibility,
                      overflow: parentStyle.overflow
                    });
                    parent = parent.parentElement;
                    level++;
                  }
                }, 100);
              } else if (element.classList.contains('adsbygoogle')) {
                console.log('AdSenseAd: AdSense element added:', element.className);
              }
            }
          });
          
          mutation.removedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'IFRAME') {
                console.log('AdSenseAd: Ad iframe removed');
              }
            }
          });
        }
      });
    });
    
    // Small delay to allow any existing ads to be detected
    const checkAndPushAd = () => {
      if (adRef.current) {
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        // Check if the ins element has already been processed by AdSense
        const alreadyProcessed = insElement && insElement.classList.contains('adsbygoogle-noablate');
        const hasIframe = adRef.current.querySelector('iframe');
        
        console.log('AdSenseAd: Checking ad slot:', {
          alreadyProcessed,
          hasIframe,
          insElementExists: !!insElement,
          insClasses: insElement?.className
        });
        
        if (!alreadyProcessed && !hasIframe) {
          console.log('AdSenseAd: Attempting to push ad to Google...');
          try {
            // @ts-ignore
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            console.log('AdSenseAd: Successfully pushed ad request to Google');
          } catch (e) {
            errorLogged = true;
            console.error('AdSenseAd: Error pushing adsbygoogle:', e);
          }
        } else if (alreadyProcessed || hasIframe) {
          console.log('AdSenseAd: Ad slot already has content, skipping push.');
        }
        
        // Start observing the ad slot for changes
        observer.observe(adRef.current, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class']
        });
      }
    };

    // Check after a short delay to allow for any existing ads
    const timeout = setTimeout(checkAndPushAd, 100);

    // Also check after 2 seconds to see if an ad was rendered
    const checkTimeout = setTimeout(() => {
      if (adRef.current) {
        const hasIframe = adRef.current.querySelector('iframe');
        const insElement = adRef.current.querySelector('ins.adsbygoogle');
        const classes = insElement?.className || '';
        
        console.log('AdSenseAd: 2-second check:', {
          hasIframe,
          insClasses: classes,
          insContent: insElement?.innerHTML?.substring(0, 100) + '...'
        });
        
        if (hasIframe) {
          console.log('AdSenseAd: Ad iframe found after 2 seconds - ad should be visible!');
        } else if (!errorLogged) {
          console.warn('AdSenseAd: No ad was rendered by Google after 2 seconds.');
        }
      }
    }, 2000);

    return () => {
      clearTimeout(timeout);
      clearTimeout(checkTimeout);
      observer.disconnect();
      // Restore original fetch
      window.fetch = originalFetch;
    };
  }, [uniqueKey]);

  return (
    <div
      key={uniqueKey}
      ref={adRef as any}
      style={{ 
        margin: '32px 0', 
        display: 'flex', 
        justifyContent: 'center'
      }}
    >
      <ins
        className="adsbygoogle"
        style={{ 
          display: 'block', 
          minHeight: 90, 
          width: '100%', 
          maxWidth: 728
        }}
        data-ad-client="ca-pub-9644041666041710"  // <-- Replace with your AdSense client ID
        data-ad-slot="7276044073"                 // <-- Replace with your AdSense slot ID
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdSenseAd; 