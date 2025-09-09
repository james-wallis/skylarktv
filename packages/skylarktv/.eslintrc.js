module.exports = {
  extends: ["../../.eslintrc.js"],
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        project: "./tsconfig.json",
        ecmaVersion: 2018,
        sourceType: "module",
        tsconfigRootDir: __dirname,
      },
      files: ["**/*.ts", "**/*.tsx"],
      extends: ["plugin:@next/next/recommended"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "no-underscore-dangle": "off",
      },
    },
    {
      files: ["e2e/**/*.ts", "e2e/**/*.tsx"],
      rules: {
        "no-await-in-loop": "off",
        "@typescript-eslint/no-misused-promises": "off",
        "import/no-extraneous-dependencies": "off",
        "no-restricted-syntax": "off",
      },
    },
  ],
};
