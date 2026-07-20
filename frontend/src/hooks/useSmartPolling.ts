import { useState, useEffect, useRef, useCallback } from 'react';

// Deep equality check to prevent unnecessary re-renders
const isEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) return false;
  
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);
  
  if (keys1.length !== keys2.length) return false;
  
  for (const key of keys1) {
    if (!keys2.includes(key) || !isEqual(obj1[key], obj2[key])) return false;
  }
  
  return true;
};

interface UseSmartPollingOptions {
  url: string;
  baseInterval?: number; // default 30000ms
  activeInterval?: number; // dynamic interval, e.g. 10000ms or 5000ms
  inactivityTimeout?: number; // default 120000ms
}

interface UseSmartPollingResult<T> {
  data: T | null;
  error: Error | null;
  fetchNow: () => Promise<T | null>;
}

export function useSmartPolling<T = any>({
  url,
  baseInterval = 30000,
  activeInterval,
  inactivityTimeout = 120000,
}: UseSmartPollingOptions): UseSmartPollingResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const dataRef = useRef<T | null>(null); 
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const backoffRef = useRef(5000); // 5s initial backoff
  
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInactiveRef = useRef(false);

  // Core fetch function
  const performFetch = useCallback(async (isManual = false): Promise<T | null> => {
    // If not manually triggered, check constraints
    if (!isManual) {
      if (isInactiveRef.current || document.visibilityState === 'hidden') {
        return null; // Skip polling if inactive or tab is hidden
      }
    }
    
    // Prevent overlapping requests
    if (isFetchingRef.current) {
      return null;
    }

    // Cancel any previous pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    isFetchingRef.current = true;

    try {
      const response = await fetch(url, { signal: abortController.signal });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      const payload = result.data ? result.data : result;
      
      // Update state only if data has meaningfully changed
      if (!isEqual(payload, dataRef.current)) {
        dataRef.current = payload;
        setData(payload);
      }
      
      setError(null);
      // Reset backoff on successful response
      backoffRef.current = 5000;
      
      return payload;
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        console.error('Smart Polling Error:', err);
        setError(err);
        // Exponential backoff logic (5s -> 10s -> 20s -> 40s -> max 60s)
        backoffRef.current = Math.min(backoffRef.current * 2, 60000);
      }
      return null;
    } finally {
      isFetchingRef.current = false;
    }
  }, [url]);

  // Initial fetch on mount or URL change
  useEffect(() => {
    performFetch(true);
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [performFetch]);

  // Visibility API tracking
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        performFetch(true); // Immediately fetch when tab becomes visible
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [performFetch]);

  // Inactivity detection
  useEffect(() => {
    const handleActivity = () => {
      // If returning from an inactive state, trigger an immediate fetch
      if (isInactiveRef.current) {
        isInactiveRef.current = false;
        performFetch(true);
      }
      
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      
      inactivityTimerRef.current = setTimeout(() => {
        isInactiveRef.current = true;
      }, inactivityTimeout);
    };

    // Using passive listeners for better scroll performance
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));
    
    handleActivity(); // Initialize the timer

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [performFetch, inactivityTimeout]);

  // Recursive polling loop to prevent interval drift and overlapping execution
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isCancelled = false;
    
    const tick = async () => {
      if (isCancelled) return;
      await performFetch();
      
      if (isCancelled) return;
      
      // Determine next interval based on error state (backoff) or active state
      const isErrorMode = backoffRef.current > 5000;
      const nextInterval = isErrorMode ? backoffRef.current : (activeInterval || baseInterval);
      
      timeoutId = setTimeout(tick, nextInterval);
    };
    
    // Start the first cycle
    const initialInterval = (backoffRef.current > 5000) ? backoffRef.current : (activeInterval || baseInterval);
    timeoutId = setTimeout(tick, initialInterval);
    
    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [performFetch, activeInterval, baseInterval]);

  return {
    data,
    error,
    fetchNow: () => performFetch(true)
  };
}
