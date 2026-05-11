/* eslint-disable import/no-extraneous-dependencies, global-require */
const plugin = require("tailwindcss/plugin");
const forms = require("@tailwindcss/forms");
const aspectRatio = require("@tailwindcss/aspect-ratio");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{ts,tsx}",
    "../skylarktv/src/components/generic/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontSize: {
        sub1: ["16px", "20px"],
        sub2: ["13px", "20px"],
        sub3: ["12px", "20px"],
        ol1: ["11px", "11px"],
        ol2: ["10px", "10px"],
      },
      colors: {
        skylarktv: {
          primary: "var(--skylarktv-primary-color)",
          accent: "var(--skylarktv-accent-color)",
          header: "var(--skylarktv-header-color)",
          purple: {
            50: "#EDE8F9",
            100: "#D0C7F0",
            300: "#917CDE",
            400: "#7760D6",
            500: "#5B45CE",
            700: "#4138BE",
          },
        },
        button: {
          secondary: "rgba(104, 108, 119, 0.65)",
          tertiary: "rgba(27, 26, 32, 0.25)",
        },
        gray: {
          50: "#F7F7FC",
          100: "#F3F3FB",
          200: "#E9E9EF",
          300: "#D8D8E1",
          400: "#B4B4BD",
          500: "#95949D",
          600: "#6E6C74",
          800: "#3C3A41",
          900: "#1B1A20",
        },
      },
      fontFamily: {
        display: "Outfit",
        body: "Outfit",
      },
      spacing: {
        gutter: "0.5rem",
        "sm-gutter": "1rem",
        "md-gutter": "3rem",
        "lg-gutter": "5rem",
        "xl-gutter": "7rem",
        "mobile-header": "3.5rem",
      },
      zIndex: {
        60: "60",
        70: "70",
        80: "80",
        90: "90",
        100: "100",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
      },
    },
  },
  corePlugins: {
    aspectRatio: false,
  },
  plugins: [
    forms,
    aspectRatio,
    require("@tailwindcss/typography"),
    plugin(({ addUtilities }) => {
      addUtilities({
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": { display: "none" },
        },
        ".bg-page-gradient": {
          "background-color": "var(--tw-gradient-to)",
          "background-image":
            "radial-gradient(circle 50vw at 50% -20vw, var(--tw-gradient-from), var(--tw-gradient-to))",
          "background-size": "100% 100%",
          "background-repeat": "no-repeat",
        },
      });
    }),
  ],
};
