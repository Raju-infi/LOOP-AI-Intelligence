import type { Config } from 'tailwindcss';
const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './lib/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: { brand: { 50:'#f5f3ff',100:'#ede9fe',500:'#7c3aed',600:'#6d28d9',700:'#5b21b6',900:'#2e1065' } },
      boxShadow: { soft: '0 12px 40px rgba(15,23,42,.08)' }
    }
  },
  plugins: []
};
export default config;
