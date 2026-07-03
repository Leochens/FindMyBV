# FindMyBV

FindMyBV 是一个给 B 站 UP 主用的小书签脚本。它解决的痛点很窄：在 B 站创作中心做互动或关联视频时，页面只能输入视频 ID，不能直接搜索自己发过的视频。这个工具会在当前页面列出你的已发布视频，支持按标题或 BV 搜索，然后一键复制 BV 号。

## 功能

- 拖拽 `找BV!` 到浏览器书签栏即可安装。
- 在 B 站创作中心页面点击书签，弹出可移动的视频搜索面板。
- 优先使用创作中心只读稿件接口读取自己的已发布视频。
- 本地缓存视频列表，减少重复请求。
- 点击视频只复制 BV 号，不修改、不删除、不发布任何 B 站数据。

## 使用方式

1. 本地运行或部署这个 Next 项目。
2. 打开首页，把 `找BV!` 按钮拖到浏览器书签栏。
3. 打开 B 站创作中心需要关联视频的位置。
4. 点击书签栏里的 `找BV!`。
5. 搜索视频标题或 BV 号，点击结果复制 BV。

## 本地开发

```bash
npm install
npm run dev
```

默认地址是 `http://localhost:3000`。

## 部署到 Vercel

这个项目是标准 Next.js App Router 项目，可以直接导入 Vercel：

```bash
npm run build
```

书签脚本在用户点击书签后运行在用户当前打开的 B 站页面里，不需要服务端密钥。

SEO 会默认使用 `https://find-my-bv.vercel.app` 作为 canonical、sitemap 和 Open Graph 基础地址。如果部署后使用了自定义域名，建议在 Vercel 环境变量里设置：

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## 项目结构

```text
app/
  BookmarkletInstaller.tsx  # 首页交互组件
  globals.css               # 页面样式
  layout.tsx                # 元信息和根布局
  og-image/route.tsx        # 社交分享图
  page.tsx                  # 生成 bookmarklet 并渲染首页
  robots.ts                 # 搜索引擎抓取规则
  sitemap.ts                # 站点地图
public/
  show-case.mp4             # 安装页演示视频
src/bookmarklet/
  bilibili-video-picker.js  # 注入到 B 站页面的书签脚本源码
src/
  site-config.ts            # SEO 和站点基础信息
scripts/
  verify-bookmarklet.mjs    # 语法和 bookmarklet 包装检查
```

## 安全边界

- 脚本只在你点击书签时运行。
- 脚本不会收集、上传或保存 Cookie。
- 脚本会请求 B 站创作中心的只读稿件列表接口。
- 脚本会把视频列表缓存在当前浏览器的 `localStorage` 中。
- 点击结果只复制 BV 号，不自动填写页面表单。

## 开源状态

当前项目已补充开源前检查文档和贡献说明。正式公开前还需要确认开源许可证，例如 MIT 或 Apache-2.0。本说明不是法律建议。
