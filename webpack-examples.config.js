var path = require('path');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var baseConfig = require('./webpack.config');

var NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

module.exports = Object.assign(baseConfig, {
  mode: NODE_ENV,
  context: __dirname + '/examples',
  devtool: NODE_ENV === 'production' ? false : 'inline-source-map',
  devServer: {
    port: 3001,
    contentBase: './examples',
    hot: true,
    liveReload: false,
  },
  entry: ['./index'],
  output: {
    path: path.join(__dirname, 'dist', 'examples'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: [
    ...baseConfig.plugins,
    new HtmlWebpackPlugin({
      template: 'index.html',
      inject: false
    })
  ],
  externals: [],
  resolve: {
    alias: {
      'react-sticky-el': path.join(__dirname, 'src')
    },
    modules: [
      'node_modules',
      path.resolve('./app')
    ],
    extensions: ['.js']
  }
});
