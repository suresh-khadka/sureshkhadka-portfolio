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
    const trackPageView = async () => {
      try {
        await apiClient.post('/track/pageview/', {
          session_id: sessionId,
          path: location.pathname,
          referrer: document.referrer,
          user_agent: navigator.userAgent,
          location_summary: 'Unknown', // Browser location API would require user permission
        });
      } catch (error) {
        console.error('Analytics PageView Error:', error);
      }
    };

    trackPageView();

    // 3. Heartbeat Mechanism
    // Send a heartbeat every 30 seconds to maintain the session
    const heartbeatInterval = setInterval(async () => {
      try {
        await apiClient.post('/track/heartbeat/', {
          session_id: sessionId,
        });
      } catch (error) {
        console.error('Analytics Heartbeat Error:', error);
      }
    }, 30000);

    return () => clearInterval(heartbeatInterval);
  }, [location]);

  return {
    getSessionId: () => localStorage.getItem('portfolio_session_id'),
  };
};
