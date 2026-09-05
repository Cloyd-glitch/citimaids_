import { useEffect, useRef } from 'react';

const dirClass = {
  up: 'reveal',
  left: 'reveal-left',
  right: 'reveal-right',
  scale: 'reveal-scale',
  fade: 'reveal',
};

export default function Reveal({
  children,
  delay = 0,
  direction = 'up',
  className = '',
  threshold = 0.12,
}) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.transitionDelay = `${delay}ms`;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          observer.unobserve(el);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, threshold]);

  return (
    <div ref={ref} className={`${dirClass[direction] || 'reveal'} ${className}`}>
      {children}
    </div>
  );
}
