var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , iconfont = require('../index')
  , assert = require('assert')
;


describe('gulp-iconfont', function() {

  describe('in stream mode', function() {

    it.only('should work with iconsfont', function(done) {
      gulp.src('tests/fixtures/iconsfont/*.svg', {buffer: false})
        .pipe(iconfont({
          fontName: 'iconsfont'
        }))
        .pipe(gulp.dest('tests/results/'))
        .pipe(es.wait(function() {
          assert.equal(
            fs.readFileSync('tests/expected/iconsfont.svg', 'utf8'),
            fs.readFileSync('tests/results/iconsfont.svg', 'utf8')
          );
          fs.unlinkSync(__dirname + '/results/iconsfont.svg');
          fs.unlinkSync(__dirname + '/results/iconsfont.ttf');
          fs.unlinkSync(__dirname + '/results/iconsfont.eot');
          fs.unlinkSync(__dirname + '/results/iconsfont.woff');
          fs.rmdirSync(__dirname + '/results/');
          done();
        }));
    });

  });

  describe('in buffer mode', function() {

    it.only('should work with iconsfont', function(done) {
      gulp.src('tests/fixtures/iconsfont/*.svg', {buffer: true})
        .pipe(iconfont({
          fontName: 'iconsfont'
        }))
        .pipe(gulp.dest('tests/results/'))
        .pipe(es.wait(function() {
          assert.equal(
            fs.readFileSync('tests/expected/iconsfont.svg', 'utf8'),
            fs.readFileSync('tests/results/iconsfont.svg', 'utf8')
          );
          fs.unlinkSync(__dirname + '/results/iconsfont.svg');
          fs.unlinkSync(__dirname + '/results/iconsfont.ttf');
          fs.unlinkSync(__dirname + '/results/iconsfont.eot');
          fs.unlinkSync(__dirname + '/results/iconsfont.woff');
          fs.rmdirSync(__dirname + '/results/');
          done();
        }));
    });

  });

});
