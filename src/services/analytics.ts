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

// Facebook Pixel tracking functions
export const trackFacebookEvent = (eventName: string, parameters?: any) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters);
  }
};

export const trackFacebookPageView = () => {
  trackFacebookEvent('PageView');
};

export const trackFacebookViewContent = (contentName: string, contentCategory?: string) => {
  trackFacebookEvent('ViewContent', {
    content_name: contentName,
    content_category: contentCategory,
    value: 1,
    currency: 'USD'
  });
};

export const trackFacebookLead = (contentName: string) => {
  trackFacebookEvent('Lead', {
    content_name: contentName,
    value: 1,
    currency: 'USD'
  });
};

export const trackFacebookCompleteRegistration = (contentName: string) => {
  trackFacebookEvent('CompleteRegistration', {
    content_name: contentName,
    value: 1,
    currency: 'USD'
  });
};

// Track page views
export const trackPageView = (path: string) => {
  ReactGA.send({ hitType: "pageview", page: path });
  trackFacebookPageView();
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
  
  // Facebook Pixel tracking for form submission
  trackFacebookCompleteRegistration('Activity Request Form');
  
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
  trackFacebookEvent('ViewContent', {
    content_name: 'Copy Activity to Clipboard',
    content_category: 'Activity Interaction',
    value: 1,
    currency: 'USD'
  });
}; 