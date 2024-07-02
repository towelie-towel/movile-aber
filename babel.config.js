/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache(true);

  return {
    presets: [["babel-preset-expo", { "jsxImportSource": "nativewind" }], "nativewind/babel"],
    plugins: ["react-native-reanimated/plugin"],
  };
};

/* 
  # from nativewind
  presets: ['module:metro-react-native-babel-preset', ['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],
  plugins: [
    ["@babel/plugin-transform-private-methods", { "loose": true }],
    'react-native-reanimated/plugin'
  ],

  return {
    presets: [["module:metro-react-native-babel-preset", { "jsxImportSource": "nativewind" }], "nativewind/babel"],
    plugins: [["@babel/plugin-transform-private-methods", { "loose": true }], "react-native-reanimated/plugin"],
  };

  # from perplexity
  presets: ['module:metro-react-native-babel-preset'],
  plugins: ['react-native-reanimated/plugin'],

  # fromstackoverflow
   module.exports = function (api) {
        api.cache(true);
        return {
            presets: ["babel-preset-expo"],
            plugins: ["expo-router/babel", "react-native-reanimated/plugin"],
        };
    };
*/