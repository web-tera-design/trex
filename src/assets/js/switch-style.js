(function () {
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href.includes('style.css') && !href.includes('style.min.css')) {
        if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
          link.setAttribute('href', href.replace('style.css', 'style.min.css'));
        }
      }
    });
  })();

// switch-style.js を開いて
// 仮に "localhost" 判定を無理やり false にする

// (function () {
//     const links = document.querySelectorAll('link[rel="stylesheet"]');
//     links.forEach(link => {
//       const href = link.getAttribute('href');
//       if (href && href.includes('style.css') && !href.includes('style.min.css')) {
//         // ここ！！仮に条件を強制実行する
//         if (true) { // ←仮テスト用「常に本番モード」とする
//           link.setAttribute('href', href.replace('style.css', 'style.min.css'));
//         }
//       }
//     });
//   })();
