import { useState, useEffect } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        // Use native fetch to bypass axios 401 interceptor on public pages
        const res = await fetch('http://localhost:8000/api/settings', {
          headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        });
        
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        
        const data = await res.json();
        setSettings(data);
      } catch (err) {
        console.warn('useSettings fetch error:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
}
