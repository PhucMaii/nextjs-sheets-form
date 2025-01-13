// module.exports = {
//     presets: [
//       '@babel/preset-env', // For modern JavaScript
//       '@babel/preset-react', // For React and JSX
//       '@babel/preset-typescript', // For TypeScript
//     ],
//   };

module.exports = {
  presets: [
    // Default presets for Babel
    '@babel/preset-env', // For modern JavaScript
    '@babel/preset-react', // For React and JSX
    '@babel/preset-typescript', // For TypeScript
  ],
  plugins: [['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }]],
  env: {
    production: {
      compact: true, // Enable compact mode for all files, regardless of size.
    },
    test: {
      // Only apply this configuration when running Jest
      presets: [
        [
          '@babel/preset-env',
          {
            targets: {
              node: 'current', // Targets the current Node.js version for Jest
            },
          },
        ],
        '@babel/preset-react',
        '@babel/preset-typescript',
      ],
    },
  },
};
