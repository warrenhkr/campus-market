import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Next 16 brings stricter React hooks linting rules that reject legitimate
      // browser state syncing in client components. Keep the App Router behavior
      // working without blocking valid hydration and event-driven logic.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/immutability": "off",
      // Convention du projet : préfixer d'un underscore un paramètre de handler
      // (ex. Next.js route handlers) volontairement inutilisé plutôt que de le
      // supprimer, quand la signature doit rester alignée avec l'API de la route.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
