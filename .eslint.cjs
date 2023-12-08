module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: { project: ['./tsconfig.json'] },
  plugins: [' @typescript-eslint', 'prettier'],
  rules: {
    '@typescript-eslint/strict-boolean-expressions': [
      2,
      {
        allowString: false,
        allowNumber: false,
      },
    ],
    'react-hooks/exhaustive-deps': 'off',
    'prettier/prettier': 'error',
  },
  ignorePatterns: ['src/**/*.test.ts', 'src/frontend/generated/*'],
};
