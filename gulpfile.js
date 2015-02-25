/*========================================
=            Requiring stuffs            =
========================================*/

var gulp = require('gulp'),
	gutil = require('gulp-util'),
	gulpif = require('gulp-if'),
	seq = require('run-sequence'),
	connect = require('gulp-connect'),
	less = require('gulp-less'),
	uglify = require('gulp-uglify'),
	sourcemaps = require('gulp-sourcemaps'),
	cssmin = require('gulp-cssmin'),
	order = require('gulp-order'),
	concat = require('gulp-concat'),
	ignore = require('gulp-ignore'),
	rimraf = require('gulp-rimraf'),
	imagemin = require('gulp-imagemin'),
	pngcrush = require('imagemin-pngcrush'),
	mobilizer = require('gulp-mobilizer'),
	replace = require('gulp-replace'),
	streamqueue = require('streamqueue'),
	rename = require('gulp-rename'),
	path = require('path'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	browserify = require('browserify'),
	partials = require('partialify'),
	reactify = require('reactify'),
	es6ify = require('es6ify'),
	lodash = require('lodash');

/*=====================================
=        Configuration                =
=====================================*/
var root = __dirname;

var config = {
	src: __dirname + '/src',
	dest: './www',
	app: './src/js/index.js',
	assets: '/assets',
	brand: 'app',
	minify_images: true,

	vendor: {
		js: [
			'./node_modules/traceur/bin/traceur-runtime.js',
		],

		fonts: []
	},

	server: {
		host: '0.0.0.0',
		port: '3000'
	},

	weinre: {
		httpPort: 8001,
		boundHost: 'localhost',
		verbose: false,
		debug: false,
		readTimeout: 5,
		deathTimeout: 15
	}
};

config.assets = path.join(config.dest, config.assets);
config.vendor.js.push('/js/vendor/**/*');

/*-----  End of Configuration  ------*/


var panic = function(err) {

	//throw err;
	console.log(err);
	this.emit('end');

};


/*================================================
=            Report Errors to Console            =
================================================*/

gulp.on('error', function(e) {
	console.log(e.err.stack);
	this.emit('end');
});


/*=========================================
=            Clean dest folder            =
=========================================*/

gulp.task('clean', function(cb) {
	return gulp.src([
			path.join(config.dest, 'index.html'),
			path.join(config.dest, 'images'),
			path.join(config.dest, 'css'),
			path.join(config.dest, 'js'),
			path.join(config.dest, 'fonts'),
			config.assets
		], {
			read: false
		})
		.pipe(rimraf());
});


/*==========================================
=            Start a web server            =
==========================================*/

gulp.task('connect', function() {
	if (typeof config.server === 'object') {
		connect.server({
			root: config.dest,
			host: config.server.host,
			port: config.server.port,
			livereload: true
		});
	} else {
		throw new Error('Connect is not configured');
	}
});


/*==============================================================
=            Setup live reloading on source changes            =
==============================================================*/

gulp.task('livereload', function() {
	gulp.src(path.join(config.dest, '*.html'))
		.pipe(connect.reload());
});


/*=====================================
=            Minify images            =
=====================================*/

gulp.task('images', function() {
	var stream = gulp.src(config.src + '/images/**/*');

	if (config.minify_images) {
		stream = stream.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngcrush()]
		}));
	}

	return stream.pipe(gulp.dest(path.join(config.assets, 'images')));
});


/*==================================
=            Copy fonts            =
==================================*/

gulp.task('fonts', function() {
	return gulp.src(config.src + '/fonts')
		.pipe(gulp.dest(path.join(config.assets, 'fonts')));
});

/*==================================
=            Copy CSS              =
==================================*/

gulp.task('css', function() {
	return gulp.src(config.src + '/css/**/*.css')
		.pipe(gulp.dest(path.join(config.assets, 'css')));
});


/*=================================================
=            Copy html files to dest              =
=================================================*/

gulp.task('html', function() {
	var inject = [];


	if (typeof config.weinre === 'object') {
		inject.push('<script src="http://' + config.weinre.boundHost + ':' + config.weinre.httpPort + '/target/target-script-min.js"></script>');
	}
	if (config.cordova) {
		inject.push('<script src="cordova.js"></script>');
	}
	gulp.src([config.src + '/html/**/*.html'])
		.pipe(replace('<!-- inject:js -->', inject.join('\n    ')))
		.pipe(gulp.dest(config.dest));
});

gulp.task('html-prod', function() {
	gulp.src([config.src + '/html/**/*.html'])
		.pipe(replace('<!-- inject:js -->', inject.join('\n    ')))
		.pipe(gulp.dest(config.dest));
});

/*======================================================================
=            Compile, minify, mobilize less                            =
======================================================================*/

gulp.task('less', function() {

	gulp.src([config.src + '/src/less/index.less'])
		.pipe(less({
			paths: [path.resolve(__dirname, config.src + 'less'), path.resolve(__dirname, 'bower_components')]
		}))
		.pipe(mobilizer('app.css', {
			'app.css': {
				hover: 'exclude',
				screens: ['0px']
			}
		}))
		.pipe(cssmin())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(path.join(config.assets, 'css')));
});


/*====================================================================
=            Compile and minify js generating source maps            =
====================================================================*/
gulp.task('js', function() {

	var b = browserify(config.app, {
		debug: config.development,
		fullPaths: false,
                baseDir: './',
		cache: {},
		packageCache: {},
		transform: [partials, reactify, es6ify.configure(/.js/)]
	});

	streamqueue({
				objectMode: true
			},
			gulp.src(config.vendor.js),
			b.bundle().pipe(source(config.app))
		)
		.on('error', panic)
		.pipe(buffer())
		.pipe(sourcemaps.init())
		.pipe(concat(config.brand + '.js'))
		.pipe(gulpif((process.env.NODE_ENV = 'production'), uglify()))
		//		.pipe(uglify())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(sourcemaps.write('.'))
		.pipe(gulp.dest(path.join(config.assets, 'js')));
});

gulp.task('vendor', function() {
	return gulp.src(config.src + '/js/vendor')
		.pipe(gulp.dest(path.join(config.assets, 'js/vendor')));
});


/*===================================================================
=            Watch for source changes and rebuild/reload            =
===================================================================*/

gulp.task('watch', function() {
	if (typeof config.server === 'object') {
		gulp.watch([config.dest + '/**/*'], ['livereload']);
	}
	gulp.watch([config.src + '/js/**/*'], ['js']);
	gulp.watch([config.src + '/html/**/*'], ['html']);
	gulp.watch([config.src + '/less/**/*'], ['less']);
	gulp.watch([config.src + '/css/**/*'], ['css']);
	gulp.watch([config.src + '/images/**/*'], ['images']);
	gulp.watch([config.src + '/fonts/**/*'], ['fonts']);

});


/*===================================================
=            Starts a Weinre Server                 =
===================================================*/

gulp.task('weinre', function() {
	if (typeof config.weinre === 'object') {
		var weinre = require('./node_modules/weinre/lib/weinre');
		weinre.run(config.weinre);
	} else {
		throw new Error('Weinre is not configured');
	}
});


/*======================================
=            Build Sequence            =
======================================*/

gulp.task('build', function(done) {
	var tasks = ['css', 'html', 'fonts', 'images', 'less', 'js'];
	seq('clean', tasks, done);
});

gulp.task('build-prod', function(done) {
	var tasks = ['html-prod', 'css', 'fonts', 'images', 'less', 'js'];
	seq('clean', tasks, done);
});

/*====================================
=            Default Task            =
====================================*/

gulp.task('default', function(done) {

	var tasks = [];

	if (typeof config.weinre === 'object') {
		tasks.push('weinre');
	}

	if (typeof config.server === 'object') {
		tasks.push('connect');
	}

	tasks.push('watch');

	seq('build', tasks, done);
});
