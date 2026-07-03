import { readFileSync } from "node:fs";
import path from "node:path";
import { BookmarkletInstaller } from "./BookmarkletInstaller";

export const dynamic = "force-static";

function createBookmarklet() {
  const sourcePath = path.join(process.cwd(), "src/bookmarklet/bilibili-video-picker.js");
  const source = readFileSync(sourcePath, "utf8");
  const encoded = Buffer.from(source, "utf8").toString("base64");

  return `javascript:(()=>{eval(new TextDecoder().decode(Uint8Array.from(atob("${encoded}"),c=>c.charCodeAt(0))))})()`;
}

export default function Home() {
  return <BookmarkletInstaller bookmarklet={createBookmarklet()} />;
}
