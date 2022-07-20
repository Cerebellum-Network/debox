/* eslint-disable @typescript-eslint/no-var-requires,import/no-extraneous-dependencies */
const { loaderByName, addBeforeLoaders, addPlugins } = require('@craco/craco');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      const mjsRule = {
        test: /\.(js|mjs)$/,
        include: [/node_modules\/@polkadot/],
        type: 'javascript/auto',
      };
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions,no-param-reassign
      webpackConfig.resolve.fallback = {
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
      };
      // console.log(JSON.stringify(webpackConfig.plugins.add, null, 2));
      // process.exit();
      addPlugins(webpackConfig, [
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        }),
      ]);
      addBeforeLoaders(webpackConfig, loaderByName('babel-loader'), mjsRule);
      return webpackConfig;
    },
  },
};
