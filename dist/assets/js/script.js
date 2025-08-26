document.addEventListener("DOMContentLoaded", () => {
  function switchViewport() {
    const viewport = document.querySelector('meta[name="viewport"]');
    const value = window.outerWidth > 375 ? "width=device-width,initial-scale=1" : "width=375";
    if (viewport.getAttribute("content") !== value) {
      viewport.setAttribute("content", value);
    }
  }
  addEventListener("resize", switchViewport, false);
  switchViewport();
});

document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    const target = document.querySelector(targetId);

    if (target) {
      e.preventDefault();

      target.scrollIntoView({
        behavior: "smooth",
        block: "start", // 上端に合わせる
      });
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // 要素取得
  const drawerIcon = document.querySelector(".c-drawer-icon");
  const drawer = document.querySelector(".c-drawer");
  const drawerOverlay = document.querySelector(".c-drawer-overlay");
  const drawerNavItem = document.querySelectorAll('.c-drawer__content a[href^="#"]');
  const header = document.querySelector(".l-header");
  const headerHeight = header ? header.offsetHeight : 0;
  const breakpoint = 768;
  let isMenuOpen = false;
  let isMenuOpenAtBreakpoint = false;

  // メニューを開く
  const openMenu = () => {
    if (!drawer.classList.contains("js-show")) {
      drawer.classList.add("js-show");
      drawerIcon.classList.add("js-show");
      drawerOverlay.classList.add("js-show");
      document.body.classList.add("is-fixed");
      isMenuOpen = true;
    }
  };

  // メニューを閉じる
  const closeMenu = () => {
    if (drawer.classList.contains("js-show")) {
      drawer.classList.remove("js-show");
      drawerIcon.classList.remove("js-show");
      drawerOverlay.classList.remove("js-show");
      document.body.classList.remove("is-fixed");
      isMenuOpen = false;
    }
  };

  // メニューの開閉を切り替え
  const toggleMenu = () => {
    if (!drawer.classList.contains("js-show")) {
      openMenu();
    } else {
      closeMenu();
    }
  };

  // ウィンドウリサイズ時の処理
  const handleResize = () => {
    const windowWidth = window.innerWidth;
    if (windowWidth > breakpoint && isMenuOpenAtBreakpoint) {
      closeMenu();
    } else if (windowWidth <= breakpoint && drawer.classList.contains("js-show")) {
      isMenuOpenAtBreakpoint = true;
    }
  };

  // ドロワー外クリックでメニューを閉じる
  const clickOuter = (event) => {
    // drawerIcon（ハンバーガーアイコン）やdrawerOverlay（オーバーレイ）自体は除外
    if (drawer.classList.contains("js-show") && !drawer.contains(event.target) && !drawerIcon.contains(event.target) && !drawerOverlay.contains(event.target) && isMenuOpen) {
      closeMenu();
    } else if (drawer.classList.contains("js-show") && !drawer.contains(event.target)) {
      isMenuOpen = true;
    }
  };

  // スムーススクロール
  const linkScroll = (target) => {
    if (target) {
      const targetPosition = target.getBoundingClientRect().top + window.scrollY;
      const offsetPosition = targetPosition - headerHeight;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  // イベント登録
  drawerIcon.addEventListener("click", toggleMenu);
  drawerOverlay.addEventListener("click", closeMenu);
  window.addEventListener("resize", handleResize);
  document.addEventListener("click", clickOuter);

  drawerNavItem.forEach((item) => {
    item.addEventListener("click", (event) => {
      event.preventDefault();
      closeMenu();
      const targetItem = document.querySelector(item.getAttribute("href"));
      linkScroll(targetItem);
    });
  });
});

function adjustMarginTop() {
  const header = document.querySelector(".l-header");
  const target = document.querySelector(".p-mv");
  if (header && target) {
    const headerHeight = header.offsetHeight;
    // ヘッダーは固定なので下げるのはp-mvだけ
    target.style.marginTop = headerHeight + "px";
    // ヘッダー自体は動かさない！
  }
}

window.addEventListener("load", adjustMarginTop);
window.addEventListener("resize", adjustMarginTop);

const target = document.querySelector(".p-cta__title--dot");
if (target) {
  const text = target.textContent;
  const wrappedText = text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  target.innerHTML = wrappedText;
}

const target1 = document.querySelector(".p-cta__title--dot1");
if (target1) {
  const text = target1.textContent;
  const wrappedText = text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  target1.innerHTML = wrappedText;
}

const target2 = document.querySelector(".p-cta__title--dot2");
if (target2) {
  const text = target2.textContent;
  const wrappedText = text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  target2.innerHTML = wrappedText;
}
const target3 = document.querySelector(".p-cta__title--dot3");
if (target3) {
  const text = target3.textContent;
  const wrappedText = text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
  target3.innerHTML = wrappedText;
}

function changeColor(hoge) {
  if (hoge.value == 0) {
    hoge.style.color = "#b4b4b4";
  } else {
    hoge.style.color = "#000";
  }
}

function setMaxHeight(selector) {
  const elements = document.querySelectorAll(selector);
  let maxHeight = 0;
  elements.forEach((el) => {
    el.style.height = "auto";
    let height = el.offsetHeight;
    if (height > maxHeight) maxHeight = height;
  });
  elements.forEach((el) => (el.style.height = maxHeight + "px"));
}

window.addEventListener("load", () => setMaxHeight(".p-voice__item-title"));
window.addEventListener("resize", () => setMaxHeight(".p-voice__item-title"));

function alignHeightToMaxLineCount() {
  const elements = document.querySelectorAll(".p-merit__description");
  if (elements.length === 0) return;

  // 行の高さ（line-height）を取得
  const style = window.getComputedStyle(elements[0]);
  const lineHeight = parseFloat(style.lineHeight);

  // 各要素の行数を計算（高さ / 行高）
  let maxLines = 0;
  elements.forEach((el) => {
    const height = el.offsetHeight;
    const lines = Math.round(height / lineHeight);
    if (lines > maxLines) {
      maxLines = lines;
    }
  });

  // 最も行数が多い要素に合わせて高さを設定
  const targetHeight = maxLines * lineHeight;
  elements.forEach((el) => {
    el.style.height = targetHeight + "px";
  });
}

// ページロード後など任意のタイミングで呼び出し
alignHeightToMaxLineCount();
