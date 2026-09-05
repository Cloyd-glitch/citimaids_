import { useState, useEffect } from 'react';
import { services as fallbackServices } from '../data/services';

/**
 * Fetch public (active-only) services from the backend API.
 * Falls back to static services if the API is offline or empty.
 *
 * Returns { services, loading, error, refetch }
 */

const SERVICE_IMAGES = {
  'home cleaning':   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'office cleaning': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  'villa cleaning':  'https://images.unsplash.com/photo-1613977257363-707ba9e6152a?w=800&auto=format&fit=crop&q=80',
  'deep cleaning':   'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'move':            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  'carpet':          'https://images.unsplash.com/photo-1555041469-db61197f213a?w=800&auto=format&fit=crop&q=80',
  'sofa':            'https://images.unsplash.com/photo-1555041469-db61197f213a?w=800&auto=format&fit=crop&q=80',
  'window':          'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
  'glass':           'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800&auto=format&fit=crop&q=80',
  'default':         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
};

const ICON_MAP = {
  'home':    'home',
  'office':  'building',
  'villa':   'villa',
  'deep':    'sparkles',
  'carpet':  'sofa',
  'sofa':    'sofa',
  'window':  'window',
  'glass':   'window',
  'move':    'truck',
};

const RATE_MAP = {
  'move':   { unit: 'flat',    label: 'flat rate' },
  'carpet': { unit: 'item',    label: '/ item' },
  'sofa':   { unit: 'item',    label: '/ item' },
  'window': { unit: 'session', label: '/ session' },
  'glass':  { unit: 'session', label: '/ session' },
};

const CATEGORY_MAP = {
  'office': 'commercial',
  'window': 'commercial',
  'glass':  'commercial',
  'villa':  'residential',
  'home':   'residential',
  'deep':   'specialized',
  'move':   'specialized',
  'carpet': 'specialized',
  'sofa':   'specialized',
};

function resolveByKeywords(name, map, defaultVal) {
  const lower = name.toLowerCase();
  for (const [keyword, value] of Object.entries(map)) {
    if (lower.includes(keyword)) return value;
  }
  return defaultVal;
}

function getImage(name) {
  const lower = name.toLowerCase();
  for (const [keyword, url] of Object.entries(SERVICE_IMAGES)) {
    if (lower.includes(keyword)) return url;
  }
  return SERVICE_IMAGES['default'];
}

function buildSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function enrichService(svc) {
  const price = Number(svc.base_price) || 0;
  const rateInfo = resolveByKeywords(svc.name, RATE_MAP, { unit: 'hour', label: '/ hr' });
  const startingPrice = price > 0
    ? `AED ${price} ${rateInfo.label}`
    : 'Contact for pricing';

  return {
    ...svc,
    title:         svc.name,
    slug:          buildSlug(svc.name),
    basePrice:     price,
    startingPrice,
    rateUnit:      rateInfo.unit,
    iconName:      resolveByKeywords(svc.name, ICON_MAP, 'sparkles'),
    category:      resolveByKeywords(svc.name, CATEGORY_MAP, 'specialized'),
    image:         getImage(svc.name),
    included:      [],
  };
}

export function useServices() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    setError(null);
    try {
      // Use the native fetch so we bypass the axios 401 interceptor
      // that would redirect the customer to /admin/login on token issues.
      // We still send the token if present so the admin sees all services.
      const token = localStorage.getItem('citimaids_token');
      const headers = { 'Accept': 'application/json', 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('http://localhost:8000/api/services', { headers });

      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }

      const json = await res.json();
      const raw = Array.isArray(json) ? json : (json?.data || []);
      if (raw.length > 0) {
        setServices(raw.map(enrichService));
      } else {
        setServices(fallbackServices);
      }
    } catch (err) {
      console.warn('useServices fetch error (using fallback):', err);
      setError(null);
      setServices(fallbackServices);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  return { services, loading, error, refetch: fetchServices };
}
