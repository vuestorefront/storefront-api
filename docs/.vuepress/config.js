
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
    editLinks: false,
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
            'general/introduction',
            'general/installation',
            'general/config'
          ]
        },
        {
          title: 'Default gateway',
          collapsable: false,
          children: [
            'default-modules/introduction',
            'default-modules/api',
            'default-modules/graphql',
            'default-modules/platforms',
            'default-modules/extensions'
          ],
        },            
        {
          title: 'Modules',
          collapsable: false,
          children: [
            'modules/introduction',
            'modules/tutorial'
          ],
        },        
        {
          title: 'Integrations',
          collapsable: false,
          children: [
            'integration/integration',
            'integration/prices-how-to',
            'integration/format-product',
            'integration/format-category',
            'integration/format-attribute',
            'integration/database-tools'
          ],
        }
      ],
    },
  },
  title: 'Storefront API',
  description: 'Storefront API Gateway',
};
