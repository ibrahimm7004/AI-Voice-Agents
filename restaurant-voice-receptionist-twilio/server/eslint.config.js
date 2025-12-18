import globals from "globals";
import pluginJs from "@eslint/js";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  {
    rules: {
      //* Avoid Bugs
      "no-undef": "error",
      semi: "error",
      "semi-spacing": "error",
      //* Best Practices
      "no-invalid-this": "error",
      "no-return-assign": "error",
      "no-unused-expressions": ["error", { allowTernary: true }],
      "no-useless-concat": "error",
      "no-useless-return": "error",
      "no-useless-catch": "off",
      "no-case-declarations": "off",
      "no-constant-condition": "warn",
      "no-unused-vars": ["warn", { argsIgnorePattern: "req|res|next|__" }],
      //* Enhance Readability
      "no-mixed-spaces-and-tabs": "warn",
      "space-before-blocks": "error",
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      //
      "max-len": ["error", { code: 1000 }],
      "keyword-spacing": "error",
      //
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1 }],
      "no-whitespace-before-property": "error",
      "nonblock-statement-body-position": "error",
      "object-property-newline": [
        "error",
        { allowAllPropertiesOnSameLine: true },
      ],
      //* ES6
      "arrow-spacing": "error",
      "no-duplicate-imports": "error",
      "no-var": "error",
      "object-shorthand": "off",
      "prefer-const": "error",
    },
  },
];
