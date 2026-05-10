module.exports = {
  extends: ["../../.eslintrc.js"],
  overrides: [
    {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
        ecmaVersion: 2020,
        sourceType: "module",
        tsconfigRootDir: __dirname,
      },
      files: ["src/**/*.ts", "src/**/*.tsx"],
      extends: ["plugin:@next/next/recommended"],
      rules: {
        "react/react-in-jsx-scope": "off",
        "no-underscore-dangle": "off",
      },
    },
    {
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.electron.json",
        ecmaVersion: 2022,
        sourceType: "module",
        tsconfigRootDir: __dirname,
      },
      files: ["electron/**/*.ts"],
      rules: {
        "import/no-extraneous-dependencies": [
          "error",
          { devDependencies: true },
        ],
        "no-restricted-syntax": "off",
        "no-continue": "off",
      },
    },
  ],
};
