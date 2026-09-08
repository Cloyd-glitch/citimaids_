import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'CitiMaids',
  tagline: 'Professional Cleaning Services Platform — Abu Dhabi, UAE',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://Cloyd-glitch.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/citimaids_/',

  // GitHub pages deployment config.
  organizationName: 'Cloyd-glitch',
  projectName: 'citimaids_',

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/Cloyd-glitch/citimaids_/tree/main/docs-site/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl:
            'https://github.com/Cloyd-glitch/citimaids_/tree/main/docs-site/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/citimaids-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'CitiMaids',
      logo: {
        alt: 'CitiMaids Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/Cloyd-glitch/citimaids_',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/getting-started/introduction',
            },
            {
              label: 'Backend API',
              to: '/docs/backend/overview',
            },
            {
              label: 'Frontend',
              to: '/docs/frontend/overview',
            },
          ],
        },
        {
          title: 'Platform',
          items: [
            {
              label: 'CitiMaids Website',
              href: 'https://citi-maids.com',
            },
            {
              label: 'API Routes',
              to: '/docs/backend/routes',
            },
            {
              label: 'Deployment',
              to: '/docs/deployment/api-deploy',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/Cloyd-glitch/citimaids_',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} CitiMaids. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['php', 'bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
