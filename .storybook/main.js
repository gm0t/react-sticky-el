module.exports = {
  stories: [ '../stories/**/*story.js' ],
  addons: [ '@storybook/addon-actions', '@storybook/addon-links' ],
  webpackFinal: async config => {
    // do mutation to the config

    config.module.rules.push({ test: /\.scss$/, loaders: [ 'style-loader', 'css-loader', 'sass-loader' ] });
    return config;
  },
};
