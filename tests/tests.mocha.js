var fs = require('fs')
  , gulp = require('gulp')
  , gutil = require('gulp-util')
  , es = require('event-stream')
  , iconfont = require('../src/index')
  , assert = require('assert')
;

// Erasing date to get an invariant created and modified font date
// See: https://github.com/fontello/svg2ttf/blob/c6de4bd45d50afc6217e150dbc69f1cd3280f8fe/lib/sfnt.js#L19
Date = (function(d) {
  function Date() {
    d.call(this, 3600);
  }
  Date.now = d.now;
  return Date;
})(Date);

describe('gulp-iconfont', function() {

  describe('in stream mode', function() {

    it('should work with iconsfont', function(done) {
      this.timeout(5000);
      gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: false})
        .pipe(iconfont({
          fontName: 'iconsfont'
        }))
        .pipe(gulp.dest(__dirname+'/results/'))
        .pipe(es.wait(function() {
          // Trick to wait for datas beeing written to disk...
          // https://github.com/wearefractal/vinyl-fs/issues/7
          setTimeout(function() {
            assert.equal(
              fs.readFileSync(__dirname+'/results/iconsfont.svg', 'utf8'),
              fs.readFileSync(__dirname+'/expected/iconsfont.svg', 'utf8')
            );
            assert.equal(
              fs.readFileSync(__dirname+'/results/iconsfont.ttf', 'utf8'),
              fs.readFileSync(__dirname+'/expected/iconsfont.ttf', 'utf8')
            );
            assert.equal(
              fs.readFileSync(__dirname+'/results/iconsfont.eot', 'utf8'),
              fs.readFileSync(__dirname+'/expected/iconsfont.eot', 'utf8')
            );
            assert.equal(
              fs.readFileSync(__dirname+'/results/iconsfont.woff', 'utf8'),
              fs.readFileSync(__dirname+'/expected/iconsfont.woff', 'utf8')
            );
            fs.unlinkSync(__dirname + '/results/iconsfont.svg');
            fs.unlinkSync(__dirname + '/results/iconsfont.ttf');
            fs.unlinkSync(__dirname + '/results/iconsfont.eot');
            fs.unlinkSync(__dirname + '/results/iconsfont.woff');
            fs.rmdirSync(__dirname + '/results/');
            done();
          }, 3000);
        }));
    });

    it('should emit an event with the codepoint mapping', function(done) {
      this.timeout(5000);
      var codepoints;
      gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: false})
        .pipe(iconfont({
          fontName: 'iconsfont'
        })).on('codepoints', function(cpts) {
          codepoints = cpts;
        })
        .pipe(gulp.dest(__dirname+'/results/'))
        .pipe(es.wait(function() {
          // Trick to wait for datas beeing written to disk...
          // https://github.com/wearefractal/vinyl-fs/issues/7
          setTimeout(function() {
            assert.deepEqual(codepoints, JSON.parse(fs.readFileSync(
                __dirname + '/expected/codepoints.json', 'utf8')));
            fs.unlinkSync(__dirname + '/results/iconsfont.svg');
            fs.unlinkSync(__dirname + '/results/iconsfont.ttf');
            fs.unlinkSync(__dirname + '/results/iconsfont.eot');
            fs.unlinkSync(__dirname + '/results/iconsfont.woff');
            fs.rmdirSync(__dirname + '/results/');
            done();
          }, 3000);
        }));
    });

  });

  describe('in buffer mode', function() {

    it('should work with iconsfont', function(done) {
      gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: true})
        .pipe(iconfont({
          fontName: 'iconsfont'
        }))
        .pipe(gulp.dest(__dirname+'/results/'))
        .pipe(es.wait(function() {
          assert.equal(
            fs.readFileSync(__dirname+'/results/iconsfont.svg', 'utf8'),
            fs.readFileSync(__dirname+'/expected/iconsfont.svg', 'utf8')
          );
          assert.equal(
            fs.readFileSync(__dirname+'/results/iconsfont.ttf', 'utf8'),
            fs.readFileSync(__dirname+'/expected/iconsfont.ttf', 'utf8')
          );
          assert.equal(
            fs.readFileSync(__dirname+'/results/iconsfont.eot', 'utf8'),
            fs.readFileSync(__dirname+'/expected/iconsfont.eot', 'utf8')
          );
          assert.equal(
            fs.readFileSync(__dirname+'/results/iconsfont.woff', 'utf8'),
            fs.readFileSync(__dirname+'/expected/iconsfont.woff', 'utf8')
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
