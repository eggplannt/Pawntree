const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Only watch the shared theme folder, not the entire monorepo
config.watchFolders = [
  path.resolve(__dirname, '../../theme'),
];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
