import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginJestDom from "eslint-plugin-jest-dom";

const testFiles = [
  "**/__tests__/**/*.{js,mjs,cjs,jsx}",
  "**/*.{test,spec}.{js,mjs,cjs,jsx}",
];

export default [
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  pluginJs.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    files: testFiles,
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    ...pluginJestDom.configs["flat/recommended"],
    rules: {
      ...pluginJestDom.configs["flat/recommended"].rules,
      "react/prop-types": "off",
    },
  },
];
