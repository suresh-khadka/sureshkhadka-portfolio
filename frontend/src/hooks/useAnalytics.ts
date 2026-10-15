import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import apiClient from '../api/client';

export const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Session Management
    let sessionId = localStorage.getItem('portfolio_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      localStorage.setItem('portfolio_session_id', sessionId);
    }

    // 2. Track Page View
    const trackPageView = () => {
      apiClient.post('/track/pageview/', {
        session_id: sessionId,
        path: location.pathname,
        referrer: document.referrer,
        user_agent: navigator.userAgent,
        location_summary: 'Unknown',
      }).catch(error => {
        // Silent fail for analytics to avoid console noise
      });
    };

    trackPageView();

    // 3. Heartbeat Mechanism
    // Send a heartbeat every 30 seconds to maintain the session
    let isMounted = true;
    const heartbeatInterval = setInterval(async () => {
      if (!isMounted) return;
      try {
        await apiClient.post('/track/heartbeat/', {
          session_id: sessionId,
        });
      } catch (error) {
        // Silent fail for analytics to avoid console noise
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(heartbeatInterval);
    };
  }, [location]);

  return {
    getSessionId: () => localStorage.getItem('portfolio_session_id'),
  };
};
