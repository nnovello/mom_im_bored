import ReactGA from 'react-ga4';

// Initialize Google Analytics
export const initGA = () => {
  const trackingId = process.env.REACT_APP_GA_TRACKING_ID;
  
  if (trackingId) {
    ReactGA.initialize(trackingId);
  } else {
    console.warn('Google Analytics tracking ID not found. Please set REACT_APP_GA_TRACKING_ID in your environment variables.');
  }
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  ReactGA.event({
    action,
    category,
    label,
    value
  });
};

// Track form submissions
export const trackFormSubmission = (ageRange: string, placeType: string, hasSituation: boolean) => {
  trackEvent('form_submit', 'engagement', 'activity_request', 1);
  
  // Track form fields
  if (ageRange) {
    trackEvent('age_selected', 'form_field', ageRange);
  }
  if (placeType) {
    trackEvent('place_selected', 'form_field', placeType);
  }
  if (hasSituation) {
    trackEvent('situation_provided', 'form_field', 'yes');
  }
};

// Track activity interactions
export const trackActivityInteraction = (action: string, activityTitle: string) => {
  trackEvent(action, 'activity_interaction', activityTitle);
};

// Track copy to clipboard
export const trackCopyToClipboard = () => {
  trackEvent('copy_activities', 'engagement', 'clipboard_copy');
}; 