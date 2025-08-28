import { type Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s - Badão Grill & Burguer",
    default: "Web - Badão Grill & Burguer",
    absolute: "Badão Grill & Burguer - O Melhor tem Nome",
  },
  description: "Hambúrgueres e espetos de qualidade premium para preparo em casa",
  icons: [
    {
      rel: "icon",
      url: "/favicon.ico",
    },
  ],
};
