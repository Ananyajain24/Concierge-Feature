import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "#f4ecdf",
        ink: "#1f1d1a",
        coral: "#e07a5f",
        forest: "#3d5a4d",
        ocean: "#4a7ba6",
      },
      fontFamily: {
        display: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
