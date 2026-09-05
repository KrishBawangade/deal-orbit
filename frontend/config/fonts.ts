import {
  Inter,
  Plus_Jakarta_Sans,
  Outfit,
  Poppins,
  Geist,
  DM_Sans,
} from "next/font/google";

/**
 * ==============================================================================
 * FONT EXPERIMENTATION & CONFIGURATION (Single Place to Change Fonts)
 * ==============================================================================
 * To experiment with a different font, simply change the active export below!
 */

/* --------------------------------------------------------------------------
 * Available Heading / Display Font Options
 * -------------------------------------------------------------------------- */
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

const poppins = Poppins({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const geistHeading = Geist({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

const dmSans = DM_Sans({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
});

/* --------------------------------------------------------------------------
 * Available Body / Sans Font Options
 * -------------------------------------------------------------------------- */
const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

/* --------------------------------------------------------------------------
 * ACTIVE FONTS (Change these to experiment!)
 * -------------------------------------------------------------------------- */

// 1. Heading font: swap with outfit, poppins, geistHeading, or dmSans
export const fontHeading = plusJakartaSans;

// 2. Body font: swap with geistSans or inter
export const fontSans = inter;
