var gulp = require('gulp');
var clean = require('gulp-clean');
var jshint = require('gulp-jshint');
var uglify = require('gulp-uglify');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync');
var serve = require('gulp-serve');
var gulpRemoveHtml = require('gulp-remove-html');
// Plugin to Notify after task completed
var notify = require( 'gulp-notify' ); // Notify after completing tasks
var inject = require('gulp-inject-string');
var argv = require('yargs').argv;

var bases = {
	src: 'src/',
	dist: 'dist/',
	temp: 'temp/'
};

var paths = {
	js: ['js/**/*.js', '!js/js_vendor/**/*.js'],
	scss: ['scss/**/*.scss', '!scss/scss_components/**/*.scss'],
	html: ['*.html'],
	img: ['img/**/*']
};

var devMode = false;

// Delete the dist directory
gulp.task('clean', function() {
	return gulp.src(bases.temp)
		.pipe(clean())
		.pipe( notify( {
			message: 'TASK: "clean" Completed!',
			onLast : true
		}));
});

// Process scripts and concatenate them into one output file
gulp.task('scripts', function() {
	return gulp.src(paths.js, {cwd: bases.src})
		// .pipe(jshint())
		// .pipe(jshint.reporter('default'))
		.pipe(uglify())
		.pipe(concat('main.min.js'))
		.pipe(gulp.dest(bases.temp + 'js/'))
		.pipe( notify( {
			message: 'TASK: "scripts" Completed!',
			onLast : true
		}));
});

// Imagemin images and ouput them in dist
gulp.task('imagemin', function() {
	return gulp.src(paths.img, {cwd: bases.src})
		.pipe(imagemin())
		.pipe(gulp.dest(bases.temp + 'img/'))
		.pipe( notify( {
			message: 'TASK: "image min" Completed!',
			onLast : true
		}));
});

//compile sass
gulp.task('sass', function(){
	return gulp.src(paths.scss, {cwd: bases.src})
		.pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
		.pipe(autoprefixer())
		// .pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest(bases.temp + 'css/'))
		.pipe( notify( {
			message: 'TASK: "sass" Completed!',
			onLast : true
		}));
});

// Copy all the html files to temp folder
gulp.task('html', function() {
	return gulp.src(paths.html, {cwd: bases.src})
		.pipe(inject.replace('<!-- path -->', '.'))
		.pipe(gulp.dest(bases.temp))
		.pipe(browserSync.reload({
			stream: true
		}));
});

//runs the server
gulp.task('serve', function() {
    browserSync.init({
    	server: {
    	    baseDir: bases.temp
    	},
    	// startPath: "/index.html",
    	host: 'localhost',
    	port: 5000
    });
});

//Remove HTML code in between these tags
// <!--<Deject>-->
// <!--</Deject>-->
// gulp nes --url www.url.com
gulp.task('nes', function () {
	var url = argv.url;
	return gulp.src(paths.html, {cwd: bases.src})
	    .pipe(gulpRemoveHtml())
	    .pipe(inject.replace('<!-- path -->', url))
	    .pipe(inject.replace('<!-- timestamp -->', '\n<!-- Created: ' + Date() + ' -->'))
	    .pipe(gulp.dest('nes/'))
	    .pipe( notify( {
	    	message: 'TASK: "Nes" Completed!',
	    	onLast : true
	    }));
});

// Copy all the html files to dist folder
gulp.task('deploy', function() {
 // Copy html
	return gulp.src(paths.html, {cwd: bases.src})
		.pipe(gulp.dest(bases.dist));
});

// Define the default task as a sequence of the above tasks
// gulp.task('default', ['scripts', 'imagemin', 'sass','watch'], function(){
// 	console.log('Building files');
// 	return console.log('Gulp is running...')
// });
gulp.task('build', function() {
	gulp.start(['scripts', 'imagemin', 'sass', 'html']);
});

// A development task to run anytime a file changes
gulp.task('watch', ['build','serve'], function(){
	devMode = true;
	gulp.watch('src/js/*.js', ['scripts']).on('change', browserSync.reload);
	gulp.watch('src/img/*', ['imagemin']);
	gulp.watch('src/scss/*.scss', ['sass']).on('change', browserSync.reload);
	gulp.watch("src/*.html", ['html']).on('change', browserSync.reload);
});
