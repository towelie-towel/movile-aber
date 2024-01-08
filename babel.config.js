/** @type {import("@babel/core").ConfigFunction} */
module.exports = function (api) {
  api.cache.forever();

  return {
    presets: ['babel-preset-expo'], // react-native-reanimated
    plugins: [
      'react-native-reanimated/plugin', // react-native-reanimated
    ],
  };
};
