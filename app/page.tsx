import { readFileSync } from "node:fs";
import path from "node:path";
import { BookmarkletInstaller } from "./BookmarkletInstaller";
import { siteConfig } from "../src/site-config";

export const dynamic = "force-static";

function createBookmarklet() {
  const sourcePath = path.join(process.cwd(), "src/bookmarklet/bilibili-video-picker.js");
  const source = readFileSync(sourcePath, "utf8");
  const encoded = Buffer.from(source, "utf8").toString("base64");

  return `javascript:(()=>{eval(new TextDecoder().decode(Uint8Array.from(atob("${encoded}"),c=>c.charCodeAt(0))))})()`;
}

export default function Home() {
  const softwareJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: siteConfig.name,
    alternateName: ["找BV", "Find My BV"],
    description: siteConfig.description,
    url: siteConfig.url,
    codeRepository: siteConfig.repoUrl,
    applicationCategory: "BrowserApplication",
    operatingSystem: "Any modern browser",
    browserRequirements: "需要支持书签栏和现代 JavaScript 的浏览器",
    inLanguage: "zh-CN",
    isAccessibleForFree: true,
    author: {
      "@type": "Person",
      name: siteConfig.authorName,
      url: siteConfig.authorUrl
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CNY"
    }
  };

  return (
    <>
      <BookmarkletInstaller bookmarklet={createBookmarklet()} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
    </>
  );
}
