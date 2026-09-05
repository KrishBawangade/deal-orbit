export const siteConfig = {
  name: "DealOrbit",
  tagline: "Don't just validate a deal. Explore it before the customer does.",
  description:
    "Intelligent, Self-Governing Sales Operations Platform. DealOrbit evaluates the commercial, operational, and customer realities of every deal before commitment.",
  url: "https://dealorbit.io",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  navItems: [
    { label: "Platform", href: "#platform" },
    { label: "Simulator", href: "#simulator" },
    { label: "Governance", href: "#governance" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Telemetry", href: "#telemetry" },
  ],
  links: {
    login: "/login",
    register: "/register",
    app: "/app",
    demo: "#simulator",
  },
};

export type SiteConfig = typeof siteConfig;
