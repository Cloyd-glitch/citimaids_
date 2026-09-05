import { useState, useEffect } from 'react';

const DEFAULT_SETTINGS = {
  business_name: 'CitiMaids Cleaning Services',
  contact_number: '+971 52 634 9461',
  additional_number: '+971 58 175 3958',
  business_email: 'info@citi-maids.com',
  additional_email: 'citimaidsuae@gmail.com',
  business_address: 'Aljazeera Tower, Room 45, Hamdan St, Abu Dhabi, UAE',
  facebook_url: 'https://web.facebook.com/people/CitiMaids-Cleaning-Services/61550129471847/',
  tiktok_url: 'https://www.tiktok.com/@citimaids?_t=8pO7VCQjaUy&_r=1',
  description: 'Premier residential, commercial, and maintenance services across Abu Dhabi.',
  timezone: 'Asia/Dubai',
  currency: 'AED',
};

let globalSettings = DEFAULT_SETTINGS;
let globalSettingsPromise = null;

export function useSettings() {
  const [settings, setSettings] = useState(globalSettings);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (globalSettings && globalSettings !== DEFAULT_SETTINGS) {
      setSettings(globalSettings);
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
        const merged = { ...DEFAULT_SETTINGS, ...data };
        globalSettings = merged;
        return merged;
      });
    }

    globalSettingsPromise.then(data => {
      setSettings(data);
      setLoading(false);
    }).catch(err => {
      console.warn('useSettings fetch error (using defaults):', err);
      setError(err);
      setLoading(false);
      globalSettingsPromise = null;
    });
  }, []);

  return { settings, loading, error };
}
