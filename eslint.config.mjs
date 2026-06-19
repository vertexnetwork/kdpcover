// Flat config for ESLint 10 / Next 16. eslint-config-next now ships native
// flat-config arrays (./core-web-vitals, ./typescript), so FlatCompat and
// @eslint/eslintrc are no longer needed. eslint-config-prettier/flat turns off
// stylistic rules that would fight Prettier.
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  {
    // eslint-plugin-react (via eslint-config-next) can't auto-detect the React
    // version under flat config; pin it so the react rules don't throw.
    settings: { react: { version: "19" } },
    rules: {
      // New in the React Compiler rule set shipped with eslint-config-next 16.
      // Our setState-in-effect sites are intentional one-shot syncs with
      // external systems (consent localStorage, iframe detection, URL-hash
      // hydration, route-change menu close). Keep as a warning rather than
      // refactoring hydration logic under a dependency bump.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    ignores: [
      "extension/dist/**",
      ".next/**",
      "node_modules/**",
      "playwright-report/**",
      "dist/**",
    ],
  },
];

export default config;
