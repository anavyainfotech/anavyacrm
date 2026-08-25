export const siteConfig = {
  name: "Anavya Infotech CRM",
  description: "Comprehensive CRM for Anavya Infotech, managing clients, projects, and invoices.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  company: {
    name: "Anavya Infotech",
    supportEmail: "support@anavyainfotech.com",
  },
};

export type SiteConfig = typeof siteConfig;
