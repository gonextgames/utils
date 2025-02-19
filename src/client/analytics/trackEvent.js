export const trackEvent = function(eventName, eventParams) {
    if (process.env.ENVIRONMENT === 'development') {
      const eventKey = `${eventName}-${JSON.stringify(eventParams)}`;
      if (window._lastTrackedEvent === eventKey) {
        return;
      }
      window._lastTrackedEvent = eventKey;
    }

    // console.log('trackEvent', eventName, eventParams);
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, eventParams);
    }
};