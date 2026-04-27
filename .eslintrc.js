// .eslintrc.js
module.exports = {
  root: true, // Stop looking for ESLint configurations in parent folders
  parser: '@typescript-eslint/parser', // Specifies the ESLint parser
  parserOptions: {
    ecmaVersion: 2022, // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
    project: './tsconfig.json', // *** IMPORTANT *** Path to your tsconfig.json
  },
  plugins: [
    '@typescript-eslint',
    'prettier'
  ],
  extends: [
    'eslint:recommended', // Recommended ESLint rules
    'plugin:@typescript-eslint/recommended', // Recommended TypeScript rules
    'plugin:@typescript-eslint/recommended-requiring-type-checking', // stricter TS rules
    'plugin:prettier/recommended' // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. MUST BE LAST.
  ],
  rules: {
    // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
    // e.g. "@typescript-eslint/explicit-function-return-type": "off",
    'prettier/prettier': 'error', // Enforce Prettier formatting as an ESLint rule
    '@typescript-eslint/no-unused-vars': 'warn', // Prefer 'warn' during development
    '@typescript-eslint/no-explicit-any': 'warn',  // Allow 'any' but with a warning
    '@typescript-eslint/explicit-function-return-type': 'off',//Consider removing this one to enforce return types
    '@typescript-eslint/no-floating-promises': 'error',//Ensures that promises are handled appropriately.
    '@typescript-eslint/no-misused-promises': [ //Avoid using promises in places not designed for them
        'error',
        {
            checksVoidReturn: false
        }
    ]

  },
  env: {
    node: true, // Enables Node.js global variables & Node.js scoping.
    es2022: true
  },
};