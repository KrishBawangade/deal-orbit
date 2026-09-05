export const siteConfig = {
  name: "Odoo Hackathon Starter",
  description: "Next.js 16 + Express Clean Architecture + Prisma Starter Template",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  navItems: [
    { label: "Design System", href: "/" },
    { label: "API Health", href: `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/health` },
    { label: "Documentation", href: "https://nextjs.org/docs" },
  ],
  links: {
    github: "https://github.com/KrishBawangade/odoo_hack_starter",
  },
};

export type SiteConfig = typeof siteConfig;
