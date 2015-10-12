'use strict';

var gulp = require('gulp');
var browserSync = require('browser-sync').create();
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var directiveReplace = require('gulp-directive-replace');
var wiredep = require('wiredep').stream;
var replace = require('gulp-replace');
var cdnizer = require('gulp-cdnizer');
var minifyHTML = require('gulp-minify-html');
var clean = require('gulp-clean');

var baseName = 'ctiColorSlider';
var jsSrc = baseName + '.js';
var cssSrc = baseName + '.css';

gulp.task('serve', ['bower', 'client', 'js', 'css'], function() {
  browserSync.init({
    server: {
      baseDir: './.tmp',
      routes: {
        "/bower_components": "bower_components",
        "/dist": "dist"
      }
    }
  });

  gulp.watch('./src/*.css', ['css']);
  gulp.watch(['./src/*.html', './src/*.js'], ['js']);
  gulp.watch(['./test_client/app.js', './test_client/client.css'],
             ['client']);
  gulp.watch('./bower.json', ['bower']);
  gulp.watch([
    './src/*.html',
    './src/*.js',
    './test_client/*.html',
    './test_client/*.js'
  ]).on('change', browserSync.reload);
});

gulp.task('js', function() {
  return gulp.src('./src/' + jsSrc)
    .pipe(directiveReplace())
    .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() {
  return gulp.src('./src/'+cssSrc)
    .pipe(autoprefixer())
    .pipe(gulp.dest('./dist'))
    .pipe(browserSync.stream());
});

gulp.task('bower', function() {
  return gulp.src('./test_client/index.html')
    .pipe(wiredep({ ignorePath: '../' }))
    .pipe(gulp.dest('./.tmp'));
});

gulp.task('client', function() {
  gulp.src('./test_client/client.css')
    .pipe(autoprefixer())
    .pipe(gulp.dest('./.tmp'))
    .pipe(browserSync.stream());
  return gulp.src('./test_client/app.js')
    .pipe(gulp.dest('./.tmp'));
});

gulp.task('uglify', ['js'], function() {
  return gulp.src('./dist/'+jsSrc)
    .pipe(uglify())
    .pipe(rename({ extname: '.min.js' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('minify', ['css'], function() {
  return gulp.src('./dist/'+cssSrc)
    .pipe(csso())
    .pipe(rename({ extname: '.min.css' }))
    .pipe(gulp.dest('./dist'));
});

gulp.task('demo', ['client'], function() {
  gulp.src('./test_client/app.js')
    .pipe(uglify())
    .pipe(gulp.dest('./demo'));
  gulp.src('./.tmp/client.css')
    .pipe(csso())
    .pipe(gulp.dest('./demo'));
  return gulp.src('./test_client/index.html')
    .pipe(replace('dist', '/cti-color-slider/dist'))
    .pipe(cdnizer([
      'google:angular',
      {
        file: 'bower_components/hammerjs/hammer.js',
        cdn: '//hammerjs.github.io/dist/hammer.min.js'
      }
    ]))
    .pipe(minifyHTML())
    .pipe(gulp.dest('./demo'));
});

gulp.task('dist', ['uglify', 'minify']);
gulp.task('default', ['serve']);
