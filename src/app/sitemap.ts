import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://tuman.help";
  const vpn = ["instagram", "facebook", "whatsapp", "youtube", "discord", "chatgpt", "tiktok", "spotify", "netflix", "telegram", "threads", "twitter", "pinterest", "linkedin", "twitch", "reddit", "snapchat", "zoom", "skype", "viber", "signal", "onlyfans", "pornhub", "steam", "gaming", "trading", "binance", "paypal", "amazon", "ebay"];

  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/stats`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/charity`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/download`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/how-to`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    ...vpn.map((app) => ({
      url: `${base}/vpn-dlya/${app}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
