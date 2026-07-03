# Contributing

感谢你愿意改进 FindMyBV。这个项目的目标是保持轻量、透明、可自己部署。

## 开发流程

```bash
npm install
npm run dev
```

提交前建议运行：

```bash
npm run verify:bookmarklet
npm run build
```

## 代码约定

- 书签脚本放在 `src/bookmarklet/bilibili-video-picker.js`。
- 安装页相关代码放在 `app/`。
- 不要把 B 站 Cookie、账号数据、真实接口响应样本或本地导出 CSV 提交到仓库。
- 行为变更要更新 `README.md`。

## Pull Request

请在 PR 中说明：

- 改了什么。
- 是否影响书签脚本运行逻辑。
- 是否跑过 `npm run verify:bookmarklet` 和 `npm run build`。
- 如果改了 UI，请附截图。
