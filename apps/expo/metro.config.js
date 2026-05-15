const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Allow Metro to resolve files from the monorepo root (e.g. theme/colors.json)
const monorepoRoot = path.resolve(__dirname, '../..');
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
];

module.exports = withNativeWind(config, { input: './global.css' });
