/* eslint-env node */

const {hostname, port, protocol} = require("./package.json").routes.test
const webpack = require("webpack")
const WebpackDevServer = require("webpack-dev-server")
const config = require("./webpack.config.test")

const server = new WebpackDevServer(webpack(config), {
  historyApiFallback: true,
  publicPath: config.output.publicPath,
  stats: {
    assets: true,
    chunks: false,
    chunkModules: false,
    colors: true,
    hash: false,
    timings: true,
    version: false
  }
})

server.listen(port, hostname, () => {
  console.log(`Listening on ${protocol}://${hostname}:${port}`)
  console.log("Starting server...")
})
