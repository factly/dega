import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config = {
  content: [
    "./index.html",
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  plugins: [tailwindcssAnimate],
} satisfies Config;

export default config;
