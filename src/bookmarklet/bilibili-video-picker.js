(function () {
  var APP_ID = "bili-up-video-picker";
  var STYLE_ID = APP_ID + "-style";
  var CACHE_KEY = APP_ID + ":cache:v1";
  var CACHE_MAX_AGE = 1000 * 60 * 60 * 24 * 14;
  var PAGE_SIZE = 50;
  var MAX_PAGES = 40;
  var PAGE_DELAY = 1200;

  if (window.__biliUpVideoPicker && window.__biliUpVideoPicker.open) {
    window.__biliUpVideoPicker.open();
    return;
  }

  var state = {
    mid: "",
    videos: [],
    query: "",
    loading: false,
    cacheTime: 0,
    status: ""
  };

  var refs = {};

  function getCookie(name) {
    var parts = document.cookie ? document.cookie.split("; ") : [];
    for (var i = 0; i < parts.length; i += 1) {
      var eq = parts[i].indexOf("=");
      var key = eq >= 0 ? parts[i].slice(0, eq) : parts[i];
      if (key === name) {
        return decodeURIComponent(eq >= 0 ? parts[i].slice(eq + 1) : "");
      }
    }
    return "";
  }

  function getMid() {
    var cookieMid = getCookie("DedeUserID");
    if (cookieMid && /^\d+$/.test(cookieMid)) return cookieMid;
    var cached = readCache();
    if (cached && cached.mid) return cached.mid;
    return "";
  }

  function readCache() {
    try {
      return JSON.parse(localStorage.getItem(CACHE_KEY) || "null");
    } catch {
      return null;
    }
  }

  function writeCache(mid, videos) {
    var payload = {
      mid: mid,
      time: Date.now(),
      videos: videos
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    state.cacheTime = payload.time;
  }

  function formatDate(seconds) {
    if (!seconds) return "";
    var d = new Date(seconds * 1000);
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    return y + "-" + m + "-" + day;
  }

  function formatCount(value) {
    var n = Number(value || 0);
    if (n >= 10000) return (n / 10000).toFixed(n >= 100000 ? 0 : 1) + "万";
    return String(n);
  }

  function normalizeSpaceVideo(item) {
    return {
      title: item.title || "",
      bvid: item.bvid || "",
      aid: item.aid || "",
      pic: item.pic || "",
      created: item.created || item.pubdate || 0,
      length: item.length || "",
      play: item.play || item.stat && item.stat.view || 0
    };
  }

  function normalizeCreatorVideo(row) {
    var item = row && (row.Archive || row.archive) || row || {};
    var stat = item.stat || row && row.stat || {};
    return {
      title: item.title || "",
      bvid: item.bvid || "",
      aid: item.aid || "",
      pic: item.cover || item.pic || "",
      created: item.ptime || item.ctime || item.pubdate || 0,
      length: item.duration ? String(Math.floor(item.duration / 60)) + ":" + String(item.duration % 60).padStart(2, "0") : "",
      play: stat.view || 0
    };
  }

  function fetchCreatorPage(page) {
    var url = new URL("https://member.bilibili.com/x/web/archives");
    url.searchParams.set("status", "pubed");
    url.searchParams.set("pn", String(page));
    url.searchParams.set("ps", String(PAGE_SIZE));
    url.searchParams.set("coop", "1");
    url.searchParams.set("interactive", "1");
    return fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      cache: "no-store"
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json || json.code !== 0) {
        throw new Error(json && json.message ? json.message : "创作中心接口请求失败");
      }
      var data = json.data || {};
      var rows = Array.isArray(data.arc_audits) ? data.arc_audits : [];
      return {
        total: data.page && data.page.count || 0,
        videos: rows.map(normalizeCreatorVideo).filter(function (video) {
          return video.bvid;
        })
      };
    });
  }

  function fetchSpacePage(mid, page, keyword) {
    var url = new URL("https://api.bilibili.com/x/space/arc/search");
    url.searchParams.set("mid", mid);
    url.searchParams.set("pn", String(page));
    url.searchParams.set("ps", String(PAGE_SIZE));
    url.searchParams.set("tid", "0");
    url.searchParams.set("keyword", keyword || "");
    url.searchParams.set("order", "pubdate");
    url.searchParams.set("jsonp", "jsonp");
    return fetch(url.toString(), {
      method: "GET",
      credentials: "include",
      mode: "cors",
      cache: "no-store"
    }).then(function (res) {
      return res.json();
    }).then(function (json) {
      if (!json || json.code !== 0) {
        throw new Error(json && json.message ? json.message : "公开空间接口请求失败");
      }
      var data = json.data || {};
      var list = data.list || {};
      var vlist = Array.isArray(list.vlist) ? list.vlist : [];
      return {
        total: data.page && data.page.count || 0,
        videos: vlist.map(normalizeSpaceVideo).filter(function (video) {
          return video.bvid;
        })
      };
    });
  }

  function sleep(ms) {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  function setStatus(message) {
    state.status = message;
    if (refs.status) refs.status.textContent = message;
  }

  function loadCachedVideos() {
    var cached = readCache();
    if (!cached || !Array.isArray(cached.videos) || !cached.videos.length) {
      return false;
    }
    state.mid = cached.mid || state.mid;
    state.videos = cached.videos;
    state.cacheTime = cached.time || 0;
    render();
    var isFresh = Date.now() - state.cacheTime < CACHE_MAX_AGE;
    setStatus("已载入本地缓存：" + state.videos.length + " 个视频" + (isFresh ? "" : "，建议刷新"));
    return true;
  }

  function askMidIfNeeded() {
    state.mid = state.mid || getMid();
    if (state.mid) return true;
    var input = window.prompt("没有从 Cookie 里读到 UID，请输入你的 B 站 UID：", "");
    if (!input || !/^\d+$/.test(input.trim())) {
      setStatus("没有 UID，暂时无法拉取视频列表");
      return false;
    }
    state.mid = input.trim();
    return true;
  }

  function mergeVideos(oldVideos, newVideos) {
    var map = {};
    var result = [];
    oldVideos.concat(newVideos).forEach(function (video) {
      var key = video.bvid || String(video.aid);
      if (!key || map[key]) return;
      map[key] = true;
      result.push(video);
    });
    result.sort(function (a, b) {
      return Number(b.created || 0) - Number(a.created || 0);
    });
    return result;
  }

  async function refreshAll() {
    if (state.loading) return;
    state.loading = true;
    updateButtons();
    var collected = [];
    var fetcher = fetchCreatorPage;
    var sourceName = "创作中心";

    try {
      setStatus("正在读取创作中心第 1 页...");
      var first;
      try {
        first = await fetcher(1);
      } catch (creatorErr) {
        if (!askMidIfNeeded()) throw creatorErr;
        fetcher = function (page) {
          return fetchSpacePage(state.mid, page, "");
        };
        sourceName = "公开空间";
        setStatus("创作中心接口不可用，改用公开空间第 1 页...");
        first = await fetcher(1);
      }

      var expectedPages = Math.min(MAX_PAGES, Math.max(1, Math.ceil((first.total || first.videos.length) / PAGE_SIZE)));
      collected = collected.concat(first.videos);
      state.videos = mergeVideos(state.videos, collected);
      render();
      setStatus("已读取 " + state.videos.length + " 个视频，" + sourceName + "第 1/" + expectedPages + " 页");

      for (var page = 2; page <= expectedPages; page += 1) {
        await sleep(PAGE_DELAY);
        var pageData = await fetcher(page);
        collected = collected.concat(pageData.videos);
        state.videos = mergeVideos(state.videos, collected);
        render();
        setStatus("已读取 " + state.videos.length + " 个视频，" + sourceName + "第 " + page + "/" + expectedPages + " 页");
        if (!pageData.videos.length) break;
      }

      state.videos = mergeVideos([], collected);
      writeCache(state.mid, state.videos);
      setStatus("刷新完成，已缓存 " + state.videos.length + " 个视频");
    } catch (err) {
      var text = err && err.message ? err.message : "刷新失败";
      setStatus(text.indexOf("频繁") >= 0 ? "请求过于频繁，稍后再刷新；已保留当前缓存" : text);
    } finally {
      state.loading = false;
      updateButtons();
    }
  }

  function onlineSearch() {
    if (state.loading) return;
    if (!askMidIfNeeded()) return;
    var keyword = state.query.trim();
    if (!keyword) {
      setStatus("先输入关键词，再在线搜索");
      return;
    }
    state.loading = true;
    updateButtons();
    setStatus("正在在线搜索：" + keyword);
    fetchSpacePage(state.mid, 1, keyword).then(function (pageData) {
      var found = pageData.videos;
      state.videos = mergeVideos(state.videos, found);
      writeCache(state.mid, state.videos);
      render();
      setStatus("在线搜索到 " + found.length + " 个结果，已合并进缓存");
    }).catch(function (err) {
      setStatus(err && err.message ? err.message : "在线搜索失败");
    }).finally(function () {
      state.loading = false;
      updateButtons();
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () {
        return true;
      }).catch(function () {
        return false;
      });
    }
    return Promise.resolve(false);
  }

  function useVideo(video) {
    copyText(video.bvid).then(function (ok) {
      if (ok) {
        setStatus("已复制：" + video.bvid);
      } else {
        window.prompt("复制 BV 号：", video.bvid);
        setStatus("请手动复制 BV 号");
      }
    });
  }

  function filteredVideos() {
    var q = state.query.trim().toLowerCase();
    if (!q) return state.videos;
    return state.videos.filter(function (video) {
      return (video.title || "").toLowerCase().indexOf(q) >= 0 || (video.bvid || "").toLowerCase().indexOf(q) >= 0;
    });
  }

  function createEl(tag, className, text) {
    var el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }

  function renderList() {
    refs.list.innerHTML = "";
    var items = filteredVideos();
    refs.count.textContent = String(items.length);
    if (!items.length) {
      refs.list.appendChild(createEl("div", "buvp-empty", state.videos.length ? "没有匹配结果" : "暂无缓存，点“刷新”拉取视频"));
      return;
    }
    items.slice(0, 200).forEach(function (video) {
      var item = createEl("button", "buvp-item");
      item.type = "button";
      var img = createEl("img", "buvp-cover");
      img.src = video.pic || "";
      img.alt = "";
      var main = createEl("span", "buvp-main");
      var title = createEl("span", "buvp-title", video.title || "(无标题)");
      var meta = createEl("span", "buvp-meta", video.bvid + " · " + formatDate(video.created) + " · " + formatCount(video.play) + "播放");
      main.appendChild(title);
      main.appendChild(meta);
      var action = createEl("span", "buvp-use", "复制");
      item.appendChild(img);
      item.appendChild(main);
      item.appendChild(action);
      item.addEventListener("click", function () {
        useVideo(video);
      });
      refs.list.appendChild(item);
    });
    if (items.length > 200) {
      refs.list.appendChild(createEl("div", "buvp-empty", "结果较多，仅显示前 200 个，请继续输入关键词"));
    }
  }

  function render() {
    if (!refs.root) return;
    renderList();
  }

  function updateButtons() {
    if (!refs.refresh) return;
    refs.refresh.disabled = state.loading;
    refs.searchOnline.disabled = state.loading;
    refs.refresh.textContent = state.loading ? "请求中..." : "刷新";
  }

  function enableDrag(root, handle) {
    var dragging = false;
    var offsetX = 0;
    var offsetY = 0;
    var previousUserSelect = "";

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    handle.addEventListener("pointerdown", function (event) {
      if (event.target.closest("button,input,textarea,a")) return;
      var rect = root.getBoundingClientRect();
      dragging = true;
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      root.style.left = rect.left + "px";
      root.style.top = rect.top + "px";
      root.style.right = "auto";
      previousUserSelect = document.body.style.userSelect;
      document.body.style.userSelect = "none";
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    handle.addEventListener("pointermove", function (event) {
      if (!dragging) return;
      var width = root.offsetWidth;
      var height = root.offsetHeight;
      var nextLeft = clamp(event.clientX - offsetX, 8, window.innerWidth - width - 8);
      var nextTop = clamp(event.clientY - offsetY, 8, window.innerHeight - height - 8);
      root.style.left = nextLeft + "px";
      root.style.top = nextTop + "px";
    });

    function stopDrag(event) {
      if (!dragging) return;
      dragging = false;
      document.body.style.userSelect = previousUserSelect;
      try {
        handle.releasePointerCapture(event.pointerId);
      } catch {}
    }

    handle.addEventListener("pointerup", stopDrag);
    handle.addEventListener("pointercancel", stopDrag);
  }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#" + APP_ID + "{position:fixed;right:24px;top:72px;z-index:2147483647;width:min(420px,calc(100vw - 32px));height:min(600px,calc(100vh - 96px));display:flex;flex-direction:column;background:#fff;color:#17181c;border:1px solid rgba(20,24,32,.14);box-shadow:0 18px 60px rgba(12,18,30,.22);border-radius:10px;font:14px/1.45 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden}",
      "#" + APP_ID + " *{box-sizing:border-box}",
      ".buvp-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid #edf0f4;background:#fbfcfe;cursor:grab;touch-action:none}",
      ".buvp-head:active{cursor:grabbing}",
      ".buvp-titlebar{font-weight:700;font-size:15px;flex:1}",
      ".buvp-close,.buvp-btn{border:1px solid #d8dde7;background:#fff;color:#222;border-radius:7px;height:30px;padding:0 10px;cursor:pointer}",
      ".buvp-close{width:30px;padding:0;font-size:18px;line-height:1}",
      ".buvp-btn:disabled{opacity:.6;cursor:wait}",
      ".buvp-search{display:flex;gap:8px;padding:12px 14px;border-bottom:1px solid #edf0f4}",
      ".buvp-input{flex:1;min-width:0;height:34px;border:1px solid #d8dde7;border-radius:7px;padding:0 10px;font:inherit;outline:none}",
      ".buvp-input:focus{border-color:#00a1d6;box-shadow:0 0 0 3px rgba(0,161,214,.12)}",
      ".buvp-status{padding:8px 14px;color:#596273;font-size:12px;border-bottom:1px solid #edf0f4}",
      ".buvp-list{overflow:auto;padding:8px;display:flex;flex-direction:column;gap:6px}",
      ".buvp-item{display:grid;grid-template-columns:72px 1fr auto;align-items:center;gap:10px;width:100%;border:1px solid transparent;background:#fff;text-align:left;border-radius:8px;padding:7px;cursor:pointer;color:inherit}",
      ".buvp-item:hover{background:#f5fbff;border-color:#ccecf8}",
      ".buvp-cover{width:72px;height:45px;object-fit:cover;border-radius:6px;background:#edf0f4}",
      ".buvp-main{min-width:0;display:flex;flex-direction:column;gap:3px}",
      ".buvp-title{font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".buvp-meta{font-size:12px;color:#6c7480;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
      ".buvp-use{font-size:12px;color:#008ac5;padding:4px 6px}",
      ".buvp-empty{padding:28px 12px;text-align:center;color:#6c7480;font-size:13px}"
    ].join("");
    document.head.appendChild(style);
  }

  function openPanel() {
    if (refs.root) {
      refs.root.style.display = "flex";
      refs.input.focus();
      return;
    }
    injectStyle();
    var root = createEl("div", "");
    root.id = APP_ID;
    root.addEventListener("mousedown", function (event) {
      event.stopPropagation();
    });
    root.addEventListener("click", function (event) {
      event.stopPropagation();
    });

    var head = createEl("div", "buvp-head");
    head.appendChild(createEl("div", "buvp-titlebar", "我的 B 站视频"));
    refs.count = createEl("span", "buvp-meta", "0");
    head.appendChild(refs.count);
    var close = createEl("button", "buvp-close", "×");
    close.type = "button";
    close.addEventListener("click", function () {
      root.style.display = "none";
    });
    head.appendChild(close);
    enableDrag(root, head);

    var search = createEl("div", "buvp-search");
    refs.input = createEl("input", "buvp-input");
    refs.input.placeholder = "搜索标题或 BV 号";
    refs.input.addEventListener("input", function () {
      state.query = refs.input.value;
      render();
    });
    refs.input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") onlineSearch();
      if (event.key === "Escape") root.style.display = "none";
    });
    refs.searchOnline = createEl("button", "buvp-btn", "在线搜");
    refs.searchOnline.type = "button";
    refs.searchOnline.addEventListener("click", onlineSearch);
    refs.refresh = createEl("button", "buvp-btn", "刷新");
    refs.refresh.type = "button";
    refs.refresh.addEventListener("click", refreshAll);
    search.appendChild(refs.input);
    search.appendChild(refs.searchOnline);
    search.appendChild(refs.refresh);

    refs.status = createEl("div", "buvp-status", "准备就绪");
    refs.list = createEl("div", "buvp-list");

    root.appendChild(head);
    root.appendChild(search);
    root.appendChild(refs.status);
    root.appendChild(refs.list);
    document.body.appendChild(root);
    refs.root = root;
    refs.input.focus();

    state.mid = getMid();
    if (!loadCachedVideos()) {
      setStatus(state.mid ? "暂无缓存，点“刷新”拉取你的视频列表" : "没有读到 UID，点“刷新”后手动输入");
      render();
    }
  }

  window.__biliUpVideoPicker = {
    open: openPanel,
    refresh: refreshAll
  };

  openPanel();
}());
