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
          <h1>关联视频找 BV 太麻烦？</h1>
          <p className="lead">
            B 站创作中心关联视频时只能输入视频 ID，不能直接搜索自己发过的稿件。这个小脚本会在当前页面列出你的视频，搜到目标后直接复制 BV 号。
          </p>

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

          <div className="steps">
            <div className="step">
              <strong>1. 拖拽安装</strong>
              <span>把蓝色按钮拖到书签栏。</span>
            </div>
            <div className="step">
              <strong>2. 打开页面</strong>
              <span>进入 B 站创作中心需要关联视频的位置。</span>
            </div>
            <div className="step">
              <strong>3. 搜索复制</strong>
              <span>按标题或 BV 搜到视频，一键复制 BV 号。</span>
            </div>
          </div>
        </main>

        <aside className="panel aside" aria-label="脚本弹窗预览">
          <div className="browser">
            <div className="bar">
              <span className="dot" />
              <span className="dot" />
              <span className="dot" />
              <span>member.bilibili.com</span>
            </div>
          </div>
          <div className="mock">
            <div className="searchline">搜索标题或 BV 号</div>
            <MockVideo />
            <MockVideo />
            <MockVideo />
          </div>
          <div className="status">刷新完成，已缓存你的视频列表</div>
        </aside>
      </section>
    </div>
  );
}

function MockVideo() {
  return (
    <div className="video">
      <div className="thumb" />
      <div>
        <div className="line" />
        <div className="line short" />
      </div>
    </div>
  );
}
