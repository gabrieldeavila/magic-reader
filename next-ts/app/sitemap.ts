import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://dissolutus.com",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/pt-BR",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/en",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/en-US",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/en-US/legere",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/en/legere",
      lastModified: new Date(),
    },
    {
      url: "https://dissolutus.com/pt-BR/legere",
      lastModified: new Date(),
    },
  ];
}
