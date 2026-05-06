import nextVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextVitals,
  {
    ignores: ["node_modules/**", ".next/**", ".npm-cache/**", "next-env.d.ts"]
  },
  {
    rules: {
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off"
    }
  }
];

export default config;
