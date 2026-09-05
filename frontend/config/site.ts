export const siteConfig = {
  name: "DealOrbit",
  tagline: "Don't just validate a deal. Explore it before the customer does.",
  description: "Intelligent, Self-Governing Sales Operations Platform (Quotation-to-Cash)",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  navItems: [
    { label: "Design System", href: "/" },
    { label: "Quotations", href: "/quotations" },
    { label: "Pipeline", href: "/pipeline" },
    { label: "Approvals", href: "/approvals" },
    { label: "Fulfillment", href: "/fulfillment" },
    { label: "Billing", href: "/billing" },
    { label: "Customer Portal", href: "/portal/demo-token" },
  ],
  links: {
    github: "https://github.com/KrishBawangade/deal-orbit",
  },
};

export type SiteConfig = typeof siteConfig;
