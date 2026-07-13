import { useEffect } from 'react';
import { API_URL } from '../config/api';

export function useWakeBackend(url?: string) {
  useEffect(() => {
    const api = url || API_URL;
    // Fire-and-forget ping to wake backend; intentionally ignore result
    fetch(`${api.replace(/\/+$/,'')}/health`).catch(() => {
      /* ignored */
    });
  }, [url]);
}
