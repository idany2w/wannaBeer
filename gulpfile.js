const { src, dest, parallel, series, watch, lastRun } = require("gulp");	// подключаем gulp
const browserSync = require("browser-sync").create();						// подключаем плагин лайв сервера Browser-Sync
const concat = require("gulp-concat");										// плагин объединения нескольких файлов в один
const uglify = require("gulp-uglify-es").default;							// сжатие js
const sass = require('gulp-sass')(require('sass'));							// плагин для работы с css-препроцессорами sass и scss
const autoprefixer = require("gulp-autoprefixer");							// название плагина говорит само за себя
const cleancss = require("gulp-clean-css");									// сжатие, красота для css
const imagemin = require("gulp-imagemin");									// крутое и простое сжатие изображений
const newer = require("gulp-newer");										// проверяет новость файлов
const del = require("del");													// удалятор файлов
const gcmq = require("gulp-group-css-media-queries");						// объединение media запросов CSS
const rename = require("gulp-rename");										// переименовать файлы
const pug = require('gulp-pug');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');
const cached = require('gulp-cached');
const remember = require('gulp-remember');
const plumber = require('gulp-plumber');


const browsersList = "last 10 version, ie 11";

const template_name = "default"
const template_path = "app/" + template_name;

const source = {
	js: [
		template_path+"/js/scripts.js",
	],
	scss: [
		template_path+"/scss/style.scss",
	],
	pug: {
		pages: template_path+"/templates/*.pug",
		chunks: template_path+"/chunks/**/*.pug",
	},
	fonts: template_path+"/fonts/**/*",
	images: template_path+"/images/**/*"
}

function scss() {
	return src(source.scss)
		.pipe(plumber())
		.pipe(sass({outputStyle: "expanded"}))              		//компилируем sass/scss в css
		//css
		.pipe(autoprefixer({
			overrideBrowserslist: [browsersList]
		}))
		.pipe(dest("dist/"+template_name+"/css/"))
		.pipe(browserSync.stream())								    //синхронизация браузера
		.pipe(gcmq())												//объединение media запросов CSS
        .pipe(
			cleancss({
				level: { 1: { specialComments: 0 } },				//полная минификация css
			})
		)
        .pipe(rename("style.min.css"))                              //выгружаем сжатый файл
		.pipe(dest("dist/"+template_name+"/css/"))					//выгрузка по указанному пути		
		.pipe(browserSync.stream());								//синхронизация браузера
}

function js() {
	return src(source.js)											//получаем файлы
		// .pipe(babel({presets: ["@babel/env"]}))
		.pipe(dest("dist/"+template_name+"/js/"))					//выгружаем несжатый файл
		.pipe(uglify())												//сжатие js файлов
		.pipe(rename("scripts.min.js"))								//выгружаем сжатый файл
		.pipe(dest("dist/"+template_name+"/js/"))					//выгрузка по указанному пути
}
function js_includes(){
	return src(template_path+"/js/includes/**/*")
	.pipe(dest("dist/"+template_name+"/js/includes/"))
}

function pug_pages() {
	return src(source.pug.pages, { since: lastRun("pug_pages") })
	.pipe(cached("pug_pages"))
	.pipe(pug({pretty:true, doctype:"HTML"}))
    .pipe(remember("pug_pages"))
	.pipe(dest("dist/"+template_name+"/"))
}

function pug_pages_nocache() {
	return src(source.pug.pages)
	.pipe(pug({pretty:true, doctype:"HTML"}))
	.pipe(dest("dist/"+template_name+"/"))
}

function bs() {
	browserSync.init({
		server: {
			baseDir: "dist/"+template_name+"/",						//корневая директория сервера
			index: "index.html",					//индексный файл
		},
		notify: true,								//всплывающее уведомление Browser-Sync
		online: true,								//свервер локально или по всей Wi-Fi сети?
	});
}

function clearstatic() {
	return del([
		"dist/"+template_name+"/fonts/",
		"dist/"+template_name+"/images/",
		"dist/"+template_name+"/js/includes/",
	])
}

function images(){
	return src(source.images)
	.pipe(dest("dist/"+template_name+"/images/"))
}
function fonts(){
	return src(source.fonts)
	.pipe(dest("dist/"+template_name+"/fonts/"))
}

function startWatch() {
    //вочим стили
    watch(template_path+"/scss/**/*", scss);

    //вочим скрипты
	watch(source.js, js);
	watch(template_path+"/js/includes/**/*", js_includes);
	watch("dist/"+template_name+"/js/**/*").on("change", browserSync.reload);
		
    watch(source.pug.chunks, pug_pages_nocache);
    watch(source.pug.pages, pug_pages_nocache);		

    //вочим html	
	watch("dist/"+template_name+"/**/*.html").on("change", browserSync.reload);

	//вочим шрифты и картинки
    watch(source.fonts, fonts).on("change", browserSync.reload);
    watch(source.images, images).on("change", browserSync.reload);
}

exports.js = js;
exports.js_includes = js_includes;
exports.scss = scss;
exports.pug_pages = pug_pages;
exports.pug_pages_nocache = pug_pages_nocache;
exports.bs = bs;
exports.clearstatic = clearstatic;
exports.fonts = fonts;
exports.images = images;
exports.startWatch = startWatch;

exports.compile = series(clearstatic, pug_pages_nocache, scss, js_includes, js, images, fonts);
exports.default = series(clearstatic, pug_pages_nocache, scss, js_includes, js, images, fonts, parallel(bs, startWatch))