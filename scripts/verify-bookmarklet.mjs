import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const sourcePath = resolve("src/bookmarklet/bilibili-video-picker.js");
const source = readFileSync(sourcePath, "utf8");

new Function(source);

const encoded = Buffer.from(source, "utf8").toString("base64");
const bookmarklet = `javascript:(()=>{eval(new TextDecoder().decode(Uint8Array.from(atob("${encoded}"),c=>c.charCodeAt(0))))})()`;

if (!bookmarklet.startsWith("javascript:")) {
  throw new Error("Bookmarklet is missing javascript: prefix");
}

console.log(`Bookmarklet OK (${source.length} source chars, ${bookmarklet.length} bookmark chars)`);
