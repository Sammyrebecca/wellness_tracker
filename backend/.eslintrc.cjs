module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
    jest: true
  },
  extends: ['standard'],
  parserOptions: {
    ecmaVersion: 2021
  },
  rules: {
    'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    'no-console': 'off',
    // Align with this project style
    'semi': ['error', 'always'],
    'space-before-function-paren': ['error', 'never']
  },
  ignorePatterns: ['node_modules/', 'coverage/', 'dist/']
};
