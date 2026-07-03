const defaultSiteUrl = "https://find-my-bv.vercel.app";

export const siteConfig = {
  name: "FindMyBV",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? defaultSiteUrl).replace(/\/$/, ""),
  title: "FindMyBV - B站UP主找BV号书签脚本 | 关联视频搜索工具",
  description:
    "FindMyBV 是给 B 站 UP 主使用的找 BV 号书签脚本。关联视频时不用翻稿件列表，直接在创作中心搜索自己的视频并复制 BV 号。",
  authorName: "罐头的AI笔记",
  authorUrl: "https://space.bilibili.com/351188457",
  repoUrl: "https://github.com/Leochens/FindMyBV",
  keywords: [
    "FindMyBV",
    "找BV",
    "BV号",
    "B站BV号",
    "B站创作中心",
    "B站关联视频",
    "Bilibili UP主工具",
    "UP主效率工具",
    "关联视频",
    "视频ID搜索",
    "复制BV号",
    "书签脚本",
    "bookmarklet"
  ]
} as const;
