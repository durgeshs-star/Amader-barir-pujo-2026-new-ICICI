/**
 * useAnudanRemaining Hook
 * 
 * Manages SSE connection for real-time remaining amount updates with exponential backoff reconnection.
 * Falls back to polling if SSE fails repeatedly.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAnudanRemainingOptions {
  campaignId: string;
  apiBaseUrl: string;
  enabled?: boolean;
}

interface UseAnudanRemainingResult {
  remainingAmount: number;
  isConnected: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useAnudanRemaining = ({
  campaignId,
  apiBaseUrl,
  enabled = true,
}: UseAnudanRemainingOptions): UseAnudanRemainingResult => {
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);
  const pollTimeoutRef = useRef<number | null>(null);
  const isPollingRef = useRef<boolean>(false);
  const backoffRef = useRef<number>(1000); // Start with 1 second
  const consecutiveFailuresRef = useRef<number>(0);
  const isMountedRef = useRef<boolean>(true);

  /**
   * Fetch remaining amount via polling (fallback mechanism)
   * Uses exponential backoff on failure
   */
  const fetchRemainingAmount = useCallback(async () => {
    if (!isMountedRef.current) return;

    try {
      const response = await fetch(
        `${apiBaseUrl}/api/anudan/remaining-single?campaignId=${encodeURIComponent(campaignId)}`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success && data.data) {
        setRemainingAmount(data.data.remainingAmount || 0);
        setError(null);
        consecutiveFailuresRef.current = 0; // Reset on success
      } else {
        throw new Error(data.message || 'Invalid response format');
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch remaining amount';
      console.error('Polling error:', errorMessage);
      setError(errorMessage);
      
      // Exponential backoff on failure
      consecutiveFailuresRef.current++;
      backoffRef.current = Math.min(backoffRef.current * 2, 30000); // Cap at 30 seconds
    }
  }, [apiBaseUrl, campaignId]);

  /**
   * Start polling with visibility state awareness
   * Pauses when tab is hidden, resumes when visible
   */
  const startPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
    }

    const poll = async () => {
      if (!isMountedRef.current) return;

      // Skip polling if tab is hidden
      if (document.visibilityState === 'hidden') {
        pollTimeoutRef.current = setTimeout(poll, 15000);
        return;
      }

      if (!isPollingRef.current) {
        isPollingRef.current = true;
        await fetchRemainingAmount();
        isPollingRef.current = false;
      }

      pollTimeoutRef.current = setTimeout(poll, 15000); // Poll every 15 seconds
    };

    poll();
  }, [fetchRemainingAmount]);

  /**
   * Stop polling
   */
  const stopPolling = useCallback(() => {
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current);
      pollTimeoutRef.current = null;
    }
    isPollingRef.current = false;
  }, []);

  /**
   * Setup SSE connection with exponential backoff reconnection
   */
  const setupSSE = useCallback(() => {
    if (!enabled || !campaignId || !isMountedRef.current) return;

    // Close existing connection
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }

    try {
      const url = `${apiBaseUrl}/api/anudan/events?campaignId=${encodeURIComponent(campaignId)}`;
      const eventSource = new EventSource(url);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (!isMountedRef.current) return;
        console.log('SSE connection opened');
        setIsConnected(true);
        setError(null);
        consecutiveFailuresRef.current = 0;
        backoffRef.current = 1000; // Reset backoff on successful connection
      };

      eventSource.addEventListener('remaining-update', (event) => {
        if (!isMountedRef.current) return;
        try {
          const data = JSON.parse(event.data);
          setRemainingAmount(data.remainingAmount || 0);
          setError(null);
          consecutiveFailuresRef.current = 0; // Reset on successful message
        } catch (err) {
          console.error('Failed to parse SSE message:', err);
        }
      });

      eventSource.onerror = (err) => {
        if (!isMountedRef.current) return;
        console.error('SSE error:', err);
        setIsConnected(false);
        eventSource.close();
        eventSourceRef.current = null;

        consecutiveFailuresRef.current++;

        // Switch to polling after 5 consecutive failures
        if (consecutiveFailuresRef.current >= 5) {
          console.log('SSE failed repeatedly, switching to polling');
          setError('SSE connection failed, using polling fallback');
          startPolling();
          return;
        }

        // Exponential backoff reconnection
        const delay = Math.min(backoffRef.current * 2, 30000); // Cap at 30 seconds
        backoffRef.current = delay;

        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }

        reconnectTimeoutRef.current = setTimeout(() => {
          if (isMountedRef.current) {
            setupSSE();
          }
        }, delay);
      };
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error('Failed to create EventSource:', err);
      setError('EventSource not supported, using polling fallback');
      startPolling();
    }
  }, [enabled, campaignId, apiBaseUrl, startPolling]);

  /**
   * Manual refresh function
   */
  const refresh = useCallback(async () => {
    await fetchRemainingAmount();
  }, [fetchRemainingAmount]);

  /**
   * Setup on mount
   */
  useEffect(() => {
    isMountedRef.current = true;

    // Initial fetch
    fetchRemainingAmount();

    // Try SSE first
    if (enabled && campaignId) {
      setupSSE();
    }

    // Handle visibility changes for polling
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isPollingRef.current) {
        // Resume polling when tab becomes visible
        fetchRemainingAmount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;

      // Cleanup SSE connection
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Cleanup reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Cleanup polling
      stopPolling();

      // Remove event listener
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, campaignId, fetchRemainingAmount, setupSSE, stopPolling]);

  return {
    remainingAmount,
    isConnected,
    error,
    refresh,
  };
};
