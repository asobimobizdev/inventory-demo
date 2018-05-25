const path = require("path");

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: 'asobi-playground',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'Asobimo blockchain playground' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },
  /*
   ** Customize the progress bar color
   */
  loading: { color: "#208eff" },
  /*
   ** Build configuration
   */
  build: {
    /*
     ** Run ESLint on save
     */
    extend(config, { isDev, isClient }) {
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/,
        });
        config.module.rules.push({
          enforce: "pre",
          test: /\.sol$/,
          // loader: 'solcLoader',
          loader: path.resolve(__dirname, 'lib/solcLoader.js'),
        });
      }
    }
  },
  mode: 'spa',
  css: [
    '@/assets/css/main.styl',
  ],

  plugins: [
    '@/plugins/plugins.js',
  ],
}
