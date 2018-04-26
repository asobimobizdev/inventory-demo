// import { path } from 'path'

module.exports = {
  mode: "spa",
  /*
  ** Headers of the page
  */
  head: {
    title: "ASOBIMO - INVENTRY DEMO",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no" },
      { hid: "description", name: "description", content: "Nuxt.js project" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.ico" },
    ],
  },
  /*
  ** Customize the progress bar color
  */
  loading: { color: "#ffdd00" },
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
          enforce: "pre",
          test: /\.(js|vue)$/,
          loader: "eslint-loader",
          exclude: /(node_modules)/,
        });

        // config.module.rules.push({
        //   enforce: 'pre',
        //   test: /\.sol/,
        //   loader: 'truffle-solidity-loader?migrations_directory=~/truffle/migrations',
        //   exclude: /(node_modules)/
        // })
      }
    },
    vendor: [
      "axios",
    ],
  },
  css: [
    "@/assets/css/main.styl",
    "element-ui/lib/theme-chalk/reset.css",
    "element-ui/lib/theme-chalk/index.css",
  ],
  generate: {
    dir: "../dist",
  },
  plugins: [
    "@/plugins/element-ui",
  ],
};