// ===============================================
// # 静的サイト対応Gulp (require版)
// ver.2.2
// ===============================================

const fs = require("fs");
const path = require("path");
const gulp = require("gulp");
const webp = require("gulp-webp").default;
const newer = require("gulp-newer");
const browserSync = require("browser-sync").create();
const gulpSass = require("gulp-sass")(require("sass"));
const notify = require("gulp-notify");
const plumber = require("gulp-plumber");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssSorter = require("css-declaration-sorter");
const cleanCSS = require("gulp-clean-css");
const mergeRules = require("postcss-merge-rules");
const { deleteAsync } = require("del");
const watch = require("gulp-watch");
const scssDirs = ["layout", "component", "project", "utility", "foundation"];
const baseDir = "./src/assets/sass/";
const htmlBeautify = require("gulp-html-beautify"); // ここを上に追加！
const isProduction = process.env.NODE_ENV === "production";

// ===============================================
// # 共通エラーハンドラ（ブラウザ通知対応版）
// ===============================================
const errorHandler = (title) => {
  return plumber({
    errorHandler: notify.onError({
      title: title,
      message: "<%= error.message %>",
      sound: "Bottle", // 効果音（Mac標準のBottleとかGlass）
    }),
  });
};

// ===============================================
// # SCSSパーシャル自動生成
// ===============================================
function generateIndexScss(done) {
  scssDirs.forEach((dir) => {
    const fullPath = path.join(baseDir, dir);
    if (fs.existsSync(fullPath) && fs.lstatSync(fullPath).isDirectory()) {
      let files = fs
        .readdirSync(fullPath)
        .filter((file) => file.endsWith(".scss") && file !== "index.scss") // index.scssは完全除外
        .sort(); // ソートするのは純粋な子scssファイルだけ

      const importStatements = files.length > 0 ? files.map((file) => `@use "${file.replace(".scss", "")}";`).join("\n") : "";

      fs.writeFileSync(path.join(fullPath, "index.scss"), `/* Auto-generated index.scss for ${dir} */\n${importStatements}\n`);
    }
  });
  done();
}

// @use "../global" as *;をパーシャル生成ファイルに付与
function injectGlobalUseToPartials(done) {
  const targetDirs = ["layout", "component", "project", "utility"];
  const injectLine = '@use "../global" as *;';

  targetDirs.forEach((dir) => {
    const dirPath = path.join(baseDir, dir);
    if (fs.existsSync(dirPath)) {
      const files = fs.readdirSync(dirPath).filter((file) => file.endsWith(".scss") && file !== "index.scss" && file.startsWith("_"));

      files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        const content = fs.readFileSync(fullPath, "utf8");

        if (!content.includes(injectLine)) {
          const updated = `${injectLine}\n${content}`;
          fs.writeFileSync(fullPath, updated);
        }
      });
    }
  });

  done();
}

// ===============================================
// # Sassをコンパイル＆圧縮
// ===============================================
function compileSass() {
  return gulp
    .src(path.join(baseDir, "style.scss"), { base: baseDir })
    .pipe(
      plumber({
        errorHandler: notify.onError("Sass Error: <%= error.message %>"),
      })
    )
    .pipe(gulpSass())
    .pipe(postcss([autoprefixer(), cssSorter(), mergeRules()]))
    .pipe(cleanCSS(isProduction ? { level: 2 } : {}))
    .pipe(gulp.dest("./dist/assets/css/"))
    .pipe(browserSync.stream());
}

// ===============================================
// # HTMLを更新（stream付き）
// ===============================================
function updateHtml() {
  return gulp.src("./**/*.html").pipe(plumber({ errorHandler })).pipe(gulp.dest("./")).pipe(browserSync.stream());
}

// ===============================================
// # JSを圧縮
// ===============================================
function formatJS() {
  return gulp
    .src("./src/assets/js/**/*.js")
    .pipe(
      plumber({
        errorHandler: notify.onError("JS Error: <%= error.message %>"),
      })
    )
    .pipe(gulp.dest("./dist/assets/js/"));
  // .pipe(browserSync.stream());
}

function browserInit(done) {
  browserSync.init({
    server: { baseDir: "./dist" },
    port: process.env.PORT || 3000,
    notify: false,
    https: process.env.HTTPS === "true",
  });
  done();
}

function reloadBrowser(done) {
  browserSync.reload();
  done();
}

function watchFiles() {
  gulp.watch([baseDir + "**/*.scss", "!" + baseDir + "**/index.scss"], gulp.series(generateIndexScss, injectGlobalUseToPartials, compileSass));
  gulp.watch("./src/assets/js/**/*.js", gulp.series(formatJS, reloadBrowser));
  // gulp.watch("./src/**/*.html", gulp.series(beautifyHtml, reloadBrowser));
  // 変更後（コールバック追加）
  gulp.watch("./src/**/*.html", (done) => {
    gulp.series(beautifyHtml, reloadBrowser)(done);
  });
  // gulp.watch("./src/assets/img/**/*.*", gulp.series(copyImage, reloadBrowser));
  gulp.watch(
    "./src/assets/img/**/*.{jpg,jpeg,png,svg,webp}",
    gulp.series(copyImage, convertToWebp, reloadBrowser) // ✅ 関数名を一致させる
  );
  // // 🔥 HTMLファイルの更新を検知して「手動で」browserSync.reload
  // gulp.watch("./**/*.html").on("change", browserSync.reload);

  // dist内HTML変更監視を追加
  gulp.watch("./dist/**/*.html").on("change", browserSync.reload);
  // ここでPHPファイルの監視を追加
  gulp.watch("./src/**/*.php").on("change", () => {
    gulp.series(copyPhp, reloadBrowser)();
  });
}

// ===============================================
// # HTML整形タスク
// ===============================================
function beautifyHtml() {
  return gulp
    .src("./src/**/*.html")
    .pipe(plumber({ errorHandler }))
    .pipe(
      htmlBeautify({
        indent_size: 2, // インデント幅（スペース2個）
        indent_char: " ", // スペースでインデント
        max_preserve_newlines: 1, // 連続改行を最大1行まで許可
        preserve_newlines: true,
        end_with_newline: true, // ファイルの最後を改行で終わらせる
      })
    )
    .pipe(gulp.dest("./dist/"));
}

// WebP変換
function convertToWebp() {
  return (
    gulp
      .src(["./src/assets/img/**/*.{jpg,jpeg,png}", "!./src/assets/img/**/.DS_Store"])
      // WebPファイルがdistに存在しない場合だけ処理
      .pipe(newer({ dest: "./dist/assets/img", ext: ".webp" }))
      // 品質も指定可能（90〜100がおすすめ）
      .pipe(webp({ quality: 90 }))
      .pipe(gulp.dest("./dist/assets/img"))
  );
}

function copyImage() {
  return gulp
    .src([
      "./src/assets/img/**/*.*",
      "!./src/assets/img/**/*.{jpg,jpeg,png}", // 変換対象はコピーしない
      "!./src/assets/img/**/.DS_Store",
    ])
    .pipe(gulp.dest("./dist/assets/img/"));
}

function copyPhp() {
  return gulp.src(["./src/*.php"]).pipe(gulp.dest("./dist"));
}

// ===============================================
// # Gulpタスク登録
// ===============================================
exports.generateIndexScssTask = generateIndexScss;
exports.compileSassTask = compileSass;
exports.formatJSTask = formatJS;
exports.beautifyHtmlTask = beautifyHtml;
exports.dev = gulp.series(gulp.parallel(formatJS, compileSass, copyImage, copyPhp, convertToWebp, beautifyHtml), browserInit, watchFiles);
exports.build = gulp.series(gulp.parallel(formatJS, compileSass, copyImage, copyPhp, convertToWebp, beautifyHtml));
exports.injectGlobalUse = injectGlobalUseToPartials;
exports.convertToWebp = convertToWebp;
