const { src, dest, parallel, series, watch } = require("gulp");
const autoprefixer = require("gulp-autoprefixer");
const concat = require("gulp-concat");
const cleanCSS = require("gulp-clean-css");
const uglify = require("gulp-uglify-es").default;
const del = require("del");
const browserSync = require("browser-sync").create();
const sass = require("gulp-sass");
const rename = require("gulp-rename");
const fileinclude = require("gulp-file-include");
const gutil = require("gulp-util");
const ftp = require("vinyl-ftp");
const sourcemaps = require("gulp-sourcemaps");
const notify = require("gulp-notify");
const svgSprite = require("gulp-svg-sprite");
const webpack = require("webpack");
const webpackStream = require("webpack-stream");
const ttf2woff = require("gulp-ttf2woff");
const ttf2woff2 = require("gulp-ttf2woff2");
const fs = require("fs");
const tiny = require("gulp-tinypng-compress");
const rev = require("gulp-rev");
const revRewrite = require("gulp-rev-rewrite");
const revdel = require("gulp-rev-delete-original");
const htmlmin = require("gulp-htmlmin");
const globbing = require('gulp-css-globbing');
const postcss = require('gulp-postcss');
const sorting = require('postcss-sorting');

const svgSprites = () => {
  return src("./src/images/svg/**.svg")
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: "../sprite.svg", //sprite file name
          },
        },
      })
    )
    .pipe(dest("./app/images"));
};

const resources = () => {
  return src("./src/resources/**").pipe(dest("./app"));
};

const imgToApp = () => {
  return src([
    "./src/images/**/*.jpg",
    "./src/images/**/*.png",
    "./src/images/**/*.jpeg",
    "./src/images/**/*.svg",
  ]).pipe(dest("./app/images"));
};

const htmlInclude = () => {
  return src(["./src/*.html"])
    .pipe(
      fileinclude({
        prefix: "@",
        basepath: "@file",
      })
    )
    .pipe(dest("./app"))
    .pipe(browserSync.stream());
};

const fonts = () => {
  src("./src/fonts/**.ttf").pipe(ttf2woff()).pipe(dest("./app/fonts/"));
  return src("./src/fonts/**.ttf").pipe(ttf2woff2()).pipe(dest("./app/fonts/"));
};

const checkWeight = (fontname) => {
  let weight = 400;
  switch (true) {
    case /Thin/.test(fontname):
      weight = 100;
      break;
    case /ExtraLight/.test(fontname):
      weight = 200;
      break;
    case /Light/.test(fontname):
      weight = 300;
      break;
    case /Regular/.test(fontname):
      weight = 400;
      break;
    case /Medium/.test(fontname):
      weight = 500;
      break;
    case /SemiBold/.test(fontname):
      weight = 600;
      break;
    case /Semi/.test(fontname):
      weight = 600;
      break;
    case /Bold/.test(fontname):
      weight = 700;
      break;
    case /ExtraBold/.test(fontname):
      weight = 800;
      break;
    case /Heavy/.test(fontname):
      weight = 700;
      break;
    case /Black/.test(fontname):
      weight = 900;
      break;
    default:
      weight = 400;
  }
  return weight;
};

const cb = () => {};
let srcFonts = "./src/scss/base/_fonts.scss";
let appFonts = "./app/fonts/";
const fontsStyle = (done) => {
  let file_content = fs.readFileSync(srcFonts);

  fs.writeFile(srcFonts, "", cb);
  fs.readdir(appFonts, function (err, items) {
    if (items) {
      let c_fontname;
      for (var i = 0; i < items.length; i++) {
        let fontname = items[i].split(".");
        fontname = fontname[0];
        let font = fontname.split("-")[0];
        let weight = checkWeight(fontname);

        if (c_fontname != fontname) {
          fs.appendFile(
            srcFonts,
            '@include font-face("' +
              font +
              '", "' +
              fontname +
              '", ' +
              weight +
              ");\r\n",
            cb
          );
        }
        c_fontname = fontname;
      }
    }
  });

  done();
};

const styles = () => {
  return src("./src/scss/**/*.scss")
    .pipe(globbing({
      extensions: ['.scss']
    }))
    // .pipe(
    //   postcss([
    //     sorting({ /* options */ 
        
    //     })
    //   ]))
    .pipe(sourcemaps.init())
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", notify.onError())
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(sourcemaps.write("."))
    .pipe(dest("./app/css/"))
    .pipe(browserSync.stream());
};

const scripts = () => {
  return src([
    "node_modules/jquery/dist/jquery.js",
    "node_modules/slick-carousel/slick/slick.js",
    "node_modules/mixitup/dist/mixitup.js",
    "node_modules/@fancyapps/fancybox/dist/jquery.fancybox.js",
    "node_modules/ion-rangeslider/js/ion.rangeSlider.js",
    "node_modules/rateyo/src/jquery.rateyo.js",
    "node_modules/jquery-form-styler/dist/jquery.formstyler.js",
    "node_modules/swiper/swiper-bundle.js",
    "node_modules/animejs/lib/anime.min.js",
    "node_modules/vanilla-tilt/dist/vanilla-tilt.min.js",
    
    "src/js/main.js",
  ])
    .pipe(concat("main.min.js"))
    .pipe(uglify())
    .pipe(dest("app/js"))
    .pipe(browserSync.stream());
};

const watchFiles = () => {
  browserSync.init({
    server: {
      baseDir: "./app",
    },
  });

  watch("./src/scss/**/*.scss", styles);
  watch("./src/js/**/*.js", scripts);
  watch("./src/html/*.html", htmlInclude);
  watch("./src/html/**/*.html", htmlInclude);
  watch("./src/*.html", htmlInclude);
  watch("./src/resources/**", resources);
  watch("./src/images/**/*.jpg", imgToApp);
  watch("./src/images/**/*.jpeg", imgToApp);
  watch("./src/images/**/*.png", imgToApp);
  watch("./src/images/svg/**/*.svg", svgSprites);
  watch("./src/fonts/**", fonts);
  watch("./src/fonts/**", fontsStyle);
};

const clean = () => {
  return del(["app/*"]);
};

exports.fileinclude = htmlInclude;
exports.styles = styles;
exports.scripts = scripts;
exports.watchFiles = watchFiles;
exports.fonts = fonts;
exports.fontsStyle = fontsStyle;

exports.default = series(
  clean,
  parallel(htmlInclude, scripts, fonts, resources, imgToApp, svgSprites),
  fontsStyle,
  styles,
  watchFiles
);

// BUILD
const tinypng = () => {
  return src([
    "./src/images/**/*.jpg",
    "./src/images/**/*.png",
    "./src/images/**/*.jpeg",
  ])
    .pipe(
      tiny({
        key: "sT4l6xnvpcy4cPv1H53jG5kdglF2GP1x",
        sigFile: "./app/images/.tinypng-sigs",
        parallel: true,
        parallelMax: 50,
        log: true,
      })
    )
    .pipe(dest("./app/images"));
};

const stylesBuild = () => {
  return src("./src/scss/**/*.scss")
    .pipe(globbing({
      extensions: ['.scss']
    }))
    .pipe(
      sass({
        outputStyle: "expanded",
      }).on("error", notify.onError())
    )
    .pipe(
      rename({
        suffix: ".min",
      })
    )
    .pipe(
      autoprefixer({
        cascade: false,
      })
    )
    .pipe(
      cleanCSS({
        level: 2,
      })
    )
    .pipe(dest("./app/css/"));
};

const scriptsBuild = () => {
  return src("./src/js/main.js")
    .pipe(
      webpackStream({
        mode: "development",
        output: {
          filename: "main.js",
        },
        module: {
          rules: [
            {
              test: /\.m?js$/,
              exclude: /(node_modules|bower_components)/,
              use: {
                loader: "babel-loader",
                options: {
                  presets: ["@babel/preset-env"],
                },
              },
            },
          ],
        },
      })
    )
    .on("error", function (err) {
      console.error("WEBPACK ERROR", err);
      this.emit("end"); // Don't stop the rest of the task
    })
    .pipe(uglify().on("error", notify.onError()))
    .pipe(dest("./app/js"));
};

const cache = () => {
  return src("app/**/*.{css,js,svg,png,jpg,jpeg,woff,woff2}", {
    base: "app",
  })
    .pipe(rev())
    .pipe(revdel())
    .pipe(dest("app"))
    .pipe(rev.manifest("rev.json"))
    .pipe(dest("app"));
};

const rewrite = () => {
  const manifest = src("app/rev.json");

  return src("app/**/*.html")
    .pipe(
      revRewrite({
        manifest,
      })
    )
    .pipe(dest("app"));
};

const htmlMinify = () => {
  return src("app/**/*.html")
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest("app"));
};

exports.cache = series(cache, rewrite);

exports.build = series(
  clean,
  parallel(htmlInclude, scriptsBuild, fonts, resources, imgToApp, svgSprites),
  fontsStyle,
  stylesBuild,
  htmlMinify,
  tinypng
);

// deploy
const deploy = () => {
  let conn = ftp.create({
    host: "",
    user: "",
    password: "",
    parallel: 10,
    log: gutil.log,
  });

  let globs = ["app/**"];

  return src(globs, {
    base: "./app",
    buffer: false,
  })
    .pipe(conn.newer("")) // only upload newer files
    .pipe(conn.dest(""));
};

exports.deploy = deploy;

// const scripts = () => {
//   src([
//     "node_modules/jquery/dist/jquery.js",
//     "node_modules/slick-carousel/slick/slick.js",
//     "node_modules/mixitup/dist/mixitup.js",
//     "./src/js/main.js",
//   ]).pipe(concat("main.min.js"));
//   return src("./src/js/main.js")
//     .pipe(
//       webpackStream({
//         mode: "development",
//         output: {
//           filename: "main.js",
//         },
//         module: {
//           rules: [
//             {
//               test: /\.m?js$/,
//               exclude: /(node_modules|bower_components)/,
//               use: {
//                 loader: "babel-loader",
//                 options: {
//                   presets: ["@babel/preset-env"],
//                 },
//               },
//             },
//           ],
//         },
//       })
//     )
//     .on("error", function (err) {
//       console.error("WEBPACK ERROR", err);
//       this.emit("end"); // Don't stop the rest of the task
//     })
//     .pipe(sourcemaps.init())
//     .pipe(uglify().on("error", notify.onError()))
//     .pipe(sourcemaps.write("."))
//     .pipe(dest("./app/js"))
//     .pipe(browserSync.stream());
// };
