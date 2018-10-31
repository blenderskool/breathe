const gulp = require('gulp');
const sass = require('gulp-sass');
const htmlmin = require('gulp-htmlmin');
const babel = require('gulp-babel');


/**
 * Parses the SCSS files, and minifies the stylesheets
 */
gulp.task('styles', function() {
  gulp.src('src/resources/scss/**/*.scss')
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(gulp.dest('dist/resources/css'));
});


/**
 * Copies the static files
 */
gulp.task('static', function() {
  gulp.src([
    'src/**/*',
    '!src/**/*.js',
    '!src/resources/scss/',
    '!src/resources/scss/**/*',
    '!src/**/*.html'
  ])
  .pipe(gulp.dest('dist'));
});

/**
 * Transpiles and minifies the JS files
 */
gulp.task('scripts', function() {
  gulp.src('src/**/*.js')
  .pipe(babel())
  .pipe(gulp.dest('dist'));

})

/**
 * Minifies the HTML template files
 */
gulp.task('html', function() {
  gulp.src('src/**/*.html')
    .pipe(htmlmin({
      collapseWhitespace: true,
      removeRedundantAttributes: true,
      removeScriptTypeAttributes: true,
      useShortDoctype: true
    }))
    .pipe(gulp.dest('dist'));
});

/**
 * Default task that builds the entire project
 */
gulp.task('default', ['static', 'styles', 'scripts', 'html']);
