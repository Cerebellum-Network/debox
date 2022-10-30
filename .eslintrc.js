module.exports = {
  extends: ['airbnb', 'airbnb-typescript', 'plugin:@typescript-eslint/recommended'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-hooks', '@typescript-eslint'],
  parserOptions: {
    project: ['./tsconfig.json'],
  },
  rules: {
    'max-len': [
      'error',
      {
        code: 120,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
      },
    ],
    'object-curly-newline': [2, { "consistent": true }],
    'react/react-in-jsx-scope': 0,
    'react/jsx-no-useless-fragment': 0,
    'import/prefer-default-export': 0,
    'react/require-default-props': 0,
    'react-hooks/exhaustive-deps': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react/jsx-one-expression-per-line': 0,
  },
};
