// tailwind.config.js
const { fontFamily } = require("tailwindcss/defaultTheme");

module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(240, 5%, 84%)",
        input: "hsl(240, 5%, 96%)",
        ring: "hsl(240, 5%, 64%)",
        background: "hsl(0, 0%, 100%)",
        foreground: "hsl(240, 10%, 4%)",
        muted: "hsl(240, 5%, 96%)",
        "muted-foreground": "hsl(240, 4%, 46%)",
        popover: "hsl(0, 0%, 100%)",
        "popover-foreground": "hsl(240, 10%, 4%)",
        card: "hsl(0, 0%, 100%)",
        "card-foreground": "hsl(240, 10%, 4%)",
        primary: "hsl(240, 100%, 60%)",
        "primary-foreground": "hsl(0, 0%, 100%)",
        secondary: "hsl(240, 4%, 92%)",
        "secondary-foreground": "hsl(240, 10%, 4%)",
        destructive: "hsl(0, 84%, 60%)",
        "destructive-foreground": "hsl(0, 0%, 100%)",
        accent: "hsl(240, 4%, 92%)",
        "accent-foreground": "hsl(240, 10%, 4%)",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
      fontFamily: {
        sans: ["Inter", ...fontFamily.sans],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
