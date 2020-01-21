module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
        'plugin:@typescript-eslint/recommended',
    ],
    parserOptions: {
        project: 'tsconfig.json',
        ecmaVersion: 2018,
        sourceType: 'module',
    },
    ignorePatterns: "old/src/**",
    rules: {
        // Special ESLint rules or overrides go here.
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/interface-name-prefix": [0, { "prefixWithI": "always" }],
        "@typescript-eslint/no-use-before-define": ["error", { "functions": false }],
        "eol-last": ["error", "always"],
        "quotes": ["error", "double", { "allowTemplateLiterals": true }],
    }
}