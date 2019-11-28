
module.exports = {
  base: '/',
  dest: 'docs/public',
  port: 8090,
  markdown: {
    toc: {
      includeLevel: [2]
    }
  },
  head: [['link', { rel: 'icon', href: '/favicon.png' }]],
  themeConfig: {
    repo: 'DivanteLtd/storefront-api',
    docsDir: 'docs',
    editLinks: true,
    sidebarDepth: 3,
    nav: [
      {
        text: 'YouTube',
        link: 'https://www.youtube.com/channel/UCkm1F3Cglty3CE1QwKQUhhg',
      },
      {
        text: 'Medium',
        link: 'https://medium.com/the-vue-storefront-journal',
      },
    ],
    sidebar: {
      '/guide/': [
      	{
          title : 'General Information',
          collapsable: false,
          children: [
            'general/introduction'
          ]
	      },
        {
          title: 'Cookbook',
          collapsable: false,
          children: [
            'cookbook/data-import',
            'cookbook/elastic',
            'cookbook/setup',
            'cookbook/integration',
            'cookbook/devops',
          ],
        },
        {
          title: 'Installation',
          collapsable: false,
          children: [
            'installation/linux-mac',
            'installation/windows',
            'installation/magento',
            'installation/production-setup',
          ],
        },
        {
          title: 'Extensions',
          collapsable: false,
          children: [
            'extensions/extending-api'
          ],
        },
      ],
    },
  },
  title: 'Storefront GraphQL API',
  description: 'Storefront GraphQL API Gateway',
};
