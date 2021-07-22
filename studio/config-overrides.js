const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const AntDesignThemePlugin = require('antd-theme-webpack-plugin');
const path = require('path');
const options = {
  antDir: path.join(__dirname, './node_modules/antd'),
  stylesDir: path.join(__dirname, './src/styles'),
  varFile: path.join(__dirname, './src/styles/variables.less'),
  themeVariables: ['@primary-color'],
  indexFileName: 'index.html',
};
module.exports = function override(config, env) {
  config.plugins.push(
    new MonacoWebpackPlugin({
      languages: ['json', 'html'],
    }),
    new AntDesignThemePlugin(options),
  );
  return config;
};
