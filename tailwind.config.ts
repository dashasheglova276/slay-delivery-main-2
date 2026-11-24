import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111111",
        paper: "#FFFFFF",
        line: "#ECECEC",
        cream: {
          DEFAULT: "#F5F8F4",
          soft: "#F3F7F2",
          100: "#EEF3EC"
        },
        glass: {
          DEFAULT: "rgba(255,255,255,0.75)",
          strong: "rgba(255,255,255,0.85)",
          faint: "rgba(255,255,255,0.55)"
        },
        lime: {
          DEFAULT: "#FF6A00",
          50: "#FFF3EA",
          100: "#FFE1CC",
          400: "#FF974D",
          500: "#FF6A00",
          600: "#E85B00",
          700: "#C94D00"
        },
        flash: {
          DEFAULT: "#FF5EA8",
          50: "#FFEFF6",
          400: "#FF7FBB",
          500: "#FF5EA8",
          600: "#E1418C"
        },
        smoke: {
          50: "#FAFAFA",
          100: "#F5F5F5",
          200: "#ECECEC",
          300: "#D3D3D6",
          400: "#A6A6AC",
          500: "#7B7B7B",
          600: "#54545C",
          700: "#38383F",
          800: "#232327",
          900: "#151517"
        }
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"]
      },
      borderRadius: {
        xl2: "1.25rem",
        xl3: "1.75rem"
      },
      boxShadow: {
        subtle: "0 1px 2px rgba(17,17,17,0.03), 0 2px 8px rgba(17,17,17,0.04)",
        soft: "0 2px 10px rgba(11,11,12,0.04), 0 12px 32px rgba(11,11,12,0.06)",
        card: "0 1px 2px rgba(11,11,12,0.03), 0 8px 24px rgba(11,11,12,0.05)",
        lift: "0 12px 40px rgba(11,11,12,0.12)",
        glowLime: "0 8px 24px rgba(255,106,0,0.22)",
        glowInk: "0 8px 28px rgba(21,21,23,0.28)",
        glowFlash: "0 8px 26px rgba(255,94,168,0.32)",
        glass: "0 8px 30px rgba(20,40,20,0.08), inset 0 1px 0 rgba(255,255,255,0.4)"
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.15)" },
          "100%": { transform: "scale(1)" }
        }
      },
      animation: {
        pop: "pop 0.3s ease-in-out"
      }
    }
  },
  plugins: [require("tailwindcss-animate")]
};

export default config;
