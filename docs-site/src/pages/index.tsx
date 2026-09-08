import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title} Docs
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started/introduction">
            🚀 Get Started
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            to="/docs/backend/routes">
            📡 API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Laravel REST API',
    emoji: '⚙️',
    description: (
      <>
        A clean Laravel 13 backend with Sanctum authentication, Eloquent models,
        and a full suite of endpoints for bookings, payments, clients, and reports.
      </>
    ),
  },
  {
    title: 'React SPA',
    emoji: '🎨',
    description: (
      <>
        A React 19 + Vite + TailwindCSS frontend serving both the customer portal
        and the protected admin panel from a single codebase.
      </>
    ),
  },
  {
    title: '16 Services & Smart Booking',
    emoji: '🧹',
    description: (
      <>
        Customers browse 4 service categories, book with a structured form, and
        receive a WhatsApp-dispatched confirmation — all without an account.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center padding-horiz--md" style={{paddingTop: '2rem'}}>
        <div style={{fontSize: '3rem'}}>{emoji}</div>
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — Developer Docs`}
      description="Developer documentation for the CitiMaids professional cleaning services platform. Covers the Laravel API, React frontend, database schema, and deployment.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
