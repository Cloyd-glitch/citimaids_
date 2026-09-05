import { useState, useEffect } from 'react';
import { services as fallbackServices } from '../data/services';

/**
 * Fetch public (active-only) services from the backend API.
 * Enriches DB models with high-res photography, categorized taxonomies,
 * checklist inclusions, and rate unit metadata.
 *
 * Returns { services, loading, error, refetch }
 */

const SERVICE_IMAGES = {
  'home cleaning':   'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=80',
  'office cleaning': 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&auto=format&fit=crop&q=80',
  'apartment':       'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=80',
  'villa cleaning':  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80',
  'deep cleaning':   'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800&auto=format&fit=crop&q=80',
  'move':            'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format&fit=crop&q=80',
  'general':         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'carpet':          'https://images.unsplash.com/photo-1600121848594-d8644e57abab?w=800&auto=format&fit=crop&q=80',
  'sofa':            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&auto=format&fit=crop&q=80',
  'window':          '/images/services/window-cleaning.jpg',
  'glass':           '/images/services/glass-cleaning.jpg',
  'ironing':         'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?w=800&auto=format&fit=crop&q=80',
  'pet':             'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
  'baby':            'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=800&auto=format&fit=crop&q=80',
  'building':        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
  'landscape':       'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&auto=format&fit=crop&q=80',
  'garden':          'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800&auto=format&fit=crop&q=80',
  'pool':            'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=800&auto=format&fit=crop&q=80',
  'default':         'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
};

const ICON_MAP = {
  'home':      'home',
  'apartment': 'home',
  'office':    'building',
  'building':  'building',
  'landscape': 'building',
  'garden':    'sparkles',
  'pool':      'sparkles',
  'villa':     'villa',
  'deep':      'sparkles',
  'general':   'sparkles',
  'ironing':   'sparkles',
  'baby':      'sparkles',
  'pet':       'sparkles',
  'carpet':    'sofa',
  'sofa':      'sofa',
  'window':    'window',
  'glass':     'window',
  'move':      'truck',
};

const RATE_MAP = {
  'move':      { unit: 'flat',    label: 'flat rate' },
  'carpet':    { unit: 'item',    label: '/ item' },
  'sofa':      { unit: 'item',    label: '/ item' },
  'window':    { unit: 'session', label: '/ session' },
  'glass':     { unit: 'session', label: '/ session' },
  'building':  { unit: 'session', label: 'Site Survey' },
  'landscape': { unit: 'session', label: 'Site Survey' },
  'garden':    { unit: 'session', label: '/ session' },
  'pool':      { unit: 'session', label: '/ session' },
};

const CATEGORY_MAP = {
  'office':    'commercial',
  'building':  'commercial',
  'villa':     'residential',
  'home':      'residential',
  'apartment': 'residential',
  'general':   'residential',
  'ironing':   'residential',
  'baby':      'residential',
  'pet':       'residential',
  'deep':      'specialized',
  'move':      'specialized',
  'carpet':    'specialized',
  'sofa':      'specialized',
  'window':    'specialized',
  'glass':     'specialized',
  'landscape': 'maintenance',
  'garden':    'maintenance',
  'pool':      'maintenance',
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
  const slug = buildSlug(svc.name);
  const lowerName = svc.name.toLowerCase();

  // 1. First attempt exact or slug match from curated static service registry
  const match = fallbackServices.find(
    (f) => f.title.toLowerCase() === lowerName || f.id === slug || f.id === lowerName
  );

  const price = Number(svc.base_price) || (match?.basePrice ?? 0);
  const rateUnit = match?.rateUnit || resolveByKeywords(svc.name, RATE_MAP, { unit: 'hour', label: '/ hr' }).unit;
  const rateLabel = match?.startingPrice || (price > 0 ? `AED ${price} ${rateUnit === 'hour' ? '/ hr' : rateUnit === 'flat' ? 'flat rate' : '/ session'}` : 'Contact for pricing');

  if (match) {
    return {
      ...svc,
      title:         svc.name || match.title,
      slug,
      basePrice:     price,
      startingPrice: rateLabel,
      rateUnit:      match.rateUnit,
      iconName:      match.iconName,
      category:      match.category,
      image:         match.image,
      included:      match.included || [],
      description:   svc.description || match.description,
    };
  }

  // 2. Fallback to keyword-based resolution if custom DB service added dynamically
  const rateInfo = resolveByKeywords(svc.name, RATE_MAP, { unit: 'hour', label: '/ hr' });
  const startingPrice = price > 0
    ? `AED ${price} ${rateInfo.label}`
    : 'Contact for pricing';

  return {
    ...svc,
    title:         svc.name,
    slug,
    basePrice:     price,
    startingPrice,
    rateUnit:      rateInfo.unit,
    iconName:      resolveByKeywords(svc.name, ICON_MAP, 'sparkles'),
    category:      resolveByKeywords(svc.name, CATEGORY_MAP, 'specialized'),
    image:         getImage(svc.name),
    included:      [],
    description:   svc.description || '',
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
