var path = require('path');
var webpack = require('webpack');
var baseConfig = require('./webpack.config');

var HtmlWebpackPlugin = require('html-webpack-plugin');

var entry = [];

if (process.env.NODE_ENV !== 'production') {
  entry = entry.concat([
    'webpack-dev-server/client?http://localhost:3001',
    'webpack/hot/only-dev-server',
    'react-hot-loader/patch'
  ]);
}

entry.push('./index');

var plugins = baseConfig.plugins;
plugins.push(new HtmlWebpackPlugin({template: 'index.html'}));

if (process.env.NODE_ENV !== 'production') {
  plugins = plugins.concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoErrorsPlugin()
  ]);
}

module.exports = Object.assign(baseConfig, {
  context: __dirname + '/examples',
  devtool: process.env.NODE_ENV === 'production' ? null : '#eval-source-map',
  entry: entry,
  externals: null,
  output: {
    path: path.join(__dirname, 'dist', 'examples'),
    filename: 'bundle.js',
    publicPath: '/'
  },
  plugins: plugins,
  resolve: {
    alias: {
      'react-sticky-el': path.join(__dirname, 'src')
    },
    root: path.resolve('./app'),
    extensions: ['', '.js']
  }
});
