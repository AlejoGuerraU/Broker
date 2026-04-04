import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primario: "#0f766e",
        secundario: "#22c55e",
        texto: "#ffffff",
      },
    },
  },
};

export default config;
