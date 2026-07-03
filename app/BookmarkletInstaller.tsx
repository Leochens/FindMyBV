"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";

type BookmarkletInstallerProps = {
  bookmarklet: string;
};

const bookmarkTitle = "找BV!";

export function BookmarkletInstaller({ bookmarklet }: BookmarkletInstallerProps) {
  const bookmarkletRef = useRef<HTMLAnchorElement>(null);
  const [copyStatus, setCopyStatus] = useState("如果不能拖拽，就复制后手动新建书签。");

  useEffect(() => {
    bookmarkletRef.current?.setAttribute("href", bookmarklet);
  }, [bookmarklet]);

  async function copyBookmarklet() {
    try {
      await navigator.clipboard.writeText(bookmarklet);
      setCopyStatus("已复制，可以手动新建书签并粘贴到网址栏。");
    } catch {
      setCopyStatus("当前浏览器不允许自动复制，请拖拽蓝色按钮安装。");
    }
  }

  function handleBookmarkletClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    setCopyStatus("请把蓝色按钮拖到书签栏；如果不能拖拽，就点“复制书签脚本”。");
  }

  return (
    <div className="page">
      <header className="topbar">
        <div className="brand">
          <span className="mark">BV</span>
          <span>FindMyBV</span>
        </div>
        <div className="pill">Bookmarklet</div>
      </header>

      <section className="hero">
        <main className="panel main">
          <div className="heroSplit">
            <div className="intro">
              <p className="heroAuthor">
                来自觉得每次找 BV 很麻烦的
                <a href="https://space.bilibili.com/351188457" target="_blank" rel="noreferrer">
                  罐头的AI笔记
                </a>
              </p>
              <h1>关联视频找 BV 太麻烦？</h1>
              <p className="lead">
                B 站创作中心关联视频时只能输入视频 ID，不能直接搜索自己发过的稿件。这个小脚本会在当前页面列出你的视频，搜到目标后直接复制 BV 号。
              </p>
            </div>

            <div className="install">
              <div className="bookmark-row">
                <a
                  ref={bookmarkletRef}
                  className="bookmarklet"
                  href="#"
                  draggable="true"
                  title={bookmarkTitle}
                  aria-label={`拖拽安装 ${bookmarkTitle}`}
                  onClick={handleBookmarkletClick}
                >
                  {bookmarkTitle}
                </a>
                <p className="drag-copy">拖到浏览器书签栏完成安装</p>
              </div>
              <div className="actions">
                <button className="copy" type="button" onClick={copyBookmarklet}>
                  复制书签脚本
                </button>
                <p className="hint" aria-live="polite">
                  {copyStatus}
                </p>
              </div>
            </div>
          </div>

          <div className="steps">
            <div className="step">
              <strong>1. 拖拽安装</strong>
              <span>把蓝色按钮拖到书签栏。</span>
            </div>
            <div className="step">
              <strong>
                2.{" "}
                <a href="https://member.bilibili.com/platform/upload-manager/article" target="_blank" rel="noreferrer">
                  去创作中心
                </a>
              </strong>
              <span>进入需要关联视频的位置。</span>
            </div>
            <div className="step">
              <strong>3. 搜索复制</strong>
              <span>按标题或 BV 搜到视频，一键复制 BV 号。</span>
            </div>
          </div>
        </main>

        <div className="repoNote">
          <p>FindMyBV 是开源小工具，代码和脚本逻辑都可以直接查看。</p>
          <a href="https://github.com/Leochens/FindMyBV" target="_blank" rel="noreferrer">
            开源地址：Leochens/FindMyBV
          </a>
          <span>觉得有用的话，欢迎顺手点个 Star。</span>
        </div>

        <aside className="panel aside" aria-label="找 BV 脚本使用演示">
          <div className="browser">
            <div className="bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span>show-case.mp4</span>
            </div>
          </div>
          <div className="showcase">
            <video
              className="showcaseVideo"
              src="/show-case.mp4"
              controls
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <div className="status">演示：搜索视频并复制 BV 号</div>
        </aside>
      </section>

      <footer className="footer">
        <div className="footerMeta">
          <p>© 2026 FindMyBV. 给 B 站 UP 主用的小脚本，快速找到视频并复制 BV 号。</p>
          <p>
            作者：
            <a href="https://space.bilibili.com/351188457" target="_blank" rel="noreferrer">
              罐头的AI笔记
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
