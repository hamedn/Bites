var gulp = require('gulp'),
  nodemon = require('gulp-nodemon'),
  plumber = require('gulp-plumber'),
  livereload = require('gulp-livereload'),
  less = require('gulp-less'),
  jst = require('gulp-jst');

gulp.task('less', function () {
  gulp.src('./app/assets/css/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest('./app/assets/css'))
    .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('./app/assets/*.less', ['less']);
});

gulp.task('develop', function () {
  livereload.listen();
  nodemon({
    script: 'app.js',
    ext: 'js ejs',
  }).on('restart', function () {
    setTimeout(function () {
      livereload.changed(__dirname);
    }, 500);
  });
});

gulp.task('default', [
  'less',
  'develop',
  'watch'
]);
