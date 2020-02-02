var path = require('path');
var webpack = require('webpack');

var NODE_ENV = process.env.NODE_ENV === 'production' ? 'production' : 'development'

module.exports = {
  mode: NODE_ENV,
  output: {
    library: 'ReactStickyEl',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(NODE_ENV)
    }),
    new webpack.optimize.OccurrenceOrderPlugin()
  ],
  externals: [
    {
      'react': {
        root: 'React',
        commonjs2: 'react',
        commonjs: 'react',
        amd: 'react'
      },
      'react-dom': {
        root: 'ReactDOM',
        commonjs2: 'react-dom',
        commonjs: 'react-dom',
        amd: 'react-dom'
      }
    }
  ],
  module: {
    rules: [
      { test: /\.js$/, loaders: ['babel-loader'], include: path.join(__dirname, 'examples') },
      { test: /\.js$/, loaders: ['babel-loader'], include: path.join(__dirname, 'src') },
      { test: /\.scss$/, loaders: ['style-loader', 'css-loader', 'sass-loader'] }
    ]
  }
};
