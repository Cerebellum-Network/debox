const { loaderByName, addBeforeLoaders } = require('@craco/craco');

module.exports = {
    webpack: {
        configure: (webpackConfig) => {
            const mjsRule = {
                test: /\.(js|mjs)$/,
                include: [/node_modules\/@polkadot/],
                type: 'javascript/auto',
            };
            addBeforeLoaders(webpackConfig, loaderByName('babel-loader'), mjsRule);
            return webpackConfig;
        },
    },
};