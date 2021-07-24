const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').DocusaurusConfig} */
module.exports = {
  title: 'Dega',
  tagline: 'Open Source publishing platform for fact-checking',
  url: 'https://dega.factlylabs.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'factly', // Usually your GitHub org/user name.
  projectName: 'dega', // Usually your repo name.
  themeConfig: {
    navbar: {
      // title: 'Dega',
      logo: {
        alt: 'Dega Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'doc',
          docId: 'introduction/what-is-dega',
          position: 'right',
          label: 'Docs',
        },
        // {
        //     to: '/blog', 
        //     label: 'Blog',
        //     position: 'left'
        // },
        {
          href: 'https://github.com/factly/dega',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'http://slack.factly.org',
          label: 'Slack',
          position: 'right',
        },        
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Factly Media & Research',
          items: [
            {
              label: 'About',
              to: 'docs/ecosystem/philosophy#about-factly',
            },
            {
              label: 'Facebook',
              to: 'https://facebook.com/factlyindia',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlyindia',
            },
            {
              label: 'Instagram',
              to: 'https://www.instagram.com/factlyindia',
            },            
            // {
            //   label: 'Privacy Policy',
            //   to: 'docs/privacy-policy',
            // },
          ],
        },
        {
          title: 'Factly Labs',
          items: [
            {
              label: 'About',
              to: 'docs/ecosystem/philosophy#about-factly-labs',
            },            
            {
              label: 'Github',
              to: 'https://github.com/factly',
            },
            {
              label: 'Slack',
              to: 'http://slack.factly.org/',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlylabs',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Slack',
              to: 'http://slack.factly.org/',
            },
            {
              label: 'Github',
              to: 'https://github.com/factly',
            },
            {
              label: 'Twitter',
              to: 'https://twitter.com/factlylabs',
            },
            {
              label: 'Contributors',
              to: 'docs/contributors/introduction'
            }
          ],
        },
        {
          title: 'Dega',
          items: [
            {
              label: 'GitHub',
              to: 'https://github.com/factly/dega',
            },
            {
              label: 'Issues',
              to: 'https://github.com/factly/dega/issues',
            },
            {
              label: 'Discussions',
              to: 'https://github.com/factly/dega/discussions',
            },
            {
              label: 'Managed Hosting',
              to: 'https://dega.factly.org',
            },            
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Factly Media & Research.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/facebook/docusaurus/edit/master/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
  customFields: {
    hero: 'Open Source. Simple. Written in React & Go.',
    hero: 'Written in Go & React. All publishing best practices built-in. For individual bloggers and scales to large organizations.',
  },

};
