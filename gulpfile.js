const gulp = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-htmlmin');
const babel = require('gulp-babel');
const concat = require('gulp-concat');


/**
 * Parses the SCSS files, and minifies the stylesheets
 */
gulp.task('styles', gulp.series((done) => {
  gulp.src('src/resources/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat('styles.css'))
    .pipe(gulp.dest('dist/resources/css'));
  done();
}));


/**
 * Copies the static files
 */
gulp.task('static', gulp.series((done) => {
  gulp.src([
    'src/**/*',
    '!src/**/*.js',
    '!src/resources/scss/',
    '!src/resources/scss/**/*',
    '!src/**/*.html'
  ])
  .pipe(gulp.dest('dist'));
  done();
}));

/**
 * Transpiles and minifies the JS files
 */
gulp.task('scripts', gulp.series((done) => {
  gulp.src('src/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'));
  done();
}));

/**
 * Minifies the HTML template files
 */
gulp.task('html', gulp.series((done) => {
  gulp.src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('dist'));
  done();
}));

/**
 * Default task that builds the entire project
 */
gulp.task('default', gulp.series(['static', 'styles', 'scripts', 'html']));

/**
 * File watcher
 */
gulp.task('dev', gulp.series((done) => {
  gulp.watch('src/**/*', ['default']);
  done();
}));