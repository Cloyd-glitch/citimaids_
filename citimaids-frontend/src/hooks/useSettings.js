import { useState, useEffect } from 'react';

let globalSettings = null;
let globalSettingsPromise = null;

export function useSettings() {
  const [settings, setSettings] = useState(globalSettings);
  const [loading, setLoading] = useState(!globalSettings);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (globalSettings) {
      setSettings(globalSettings);
      setLoading(false);
      return;
    }

    if (!globalSettingsPromise) {
      globalSettingsPromise = fetch('http://localhost:8000/api/settings', {
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
      }).then(async (res) => {
        if (!res.ok) {
          throw new Error(`API returned ${res.status}`);
        }
        const data = await res.json();
        globalSettings = data;
        return data;
      });
    }

    globalSettingsPromise.then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(err => {
      console.warn('useSettings fetch error:', err);
      setError(err);
      setLoading(false);
      globalSettingsPromise = null;
    });
  }, []);

  return { settings, loading, error };
}
