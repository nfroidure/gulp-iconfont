var fs = require('fs');
var gulp = require('gulp');
var gutil = require('gulp-util');
var iconfont = require('../src/index');
var util = require('util');
var assert = require('assert');
var rimraf = require('rimraf');
var neatequal = require('neatequal');
var streamtest = require('streamtest');

describe('gulp-iconfont', function() {
  var generationTimestamp = 3;

  streamtest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {

      describe('in stream mode', function() {

        it('should output SVG font with svg option to true', function(done) {
          this.timeout(5000);
          var contents = [];
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: false})
            .pipe(iconfont({
              fontName: 'iconsfont',
              svg: true,
              timestamp: generationTimestamp
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              files.forEach(function(file, index) {
                file.contents.pipe(streamtest[version].toChunks(function(err, chunks) {
                  if(err) {
                    return done(err);
                  }
                  contents.push(Buffer.concat(chunks));
                  if(contents.length === files.length) {
                    assert.deepEqual(
                      contents[0],
                      fs.readFileSync(__dirname + '/expected/iconsfont.svg')
                    );
                    assert.deepEqual(
                      contents[1],
                      fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
                    );
                    assert.deepEqual(
                      contents[2],
                      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
                    );
                    assert.deepEqual(
                      contents[3],
                      fs.readFileSync(__dirname + '/expected/iconsfont.woff')
                    );
                    assert.deepEqual(
                      contents[4],
                      fs.readFileSync(__dirname + '/expected/iconsfont.eot')
                    );
                    done();
                  }
                }));
              });
            }));
        });

        it('should work with iconsfont', function(done) {
          var contents = [];
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: false})
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              files.forEach(function(file, index) {
                file.contents.pipe(streamtest[version].toChunks(function(err, chunks) {
                  if(err) {
                    return done(err);
                  }
                  contents.push(Buffer.concat(chunks));
                  if(contents.length === files.length) {
                    assert.deepEqual(
                      contents[0],
                      fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
                    );
                    assert.deepEqual(
                      contents[1],
                      fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
                    );
                    assert.deepEqual(
                      contents[2],
                      fs.readFileSync(__dirname + '/expected/iconsfont.woff')
                    );
                    assert.deepEqual(
                      contents[3],
                      fs.readFileSync(__dirname + '/expected/iconsfont.eot')
                    );
                    done();
                  }
                }));
              });
            }));
        });

        it('should emit an event with the codepoint mapping', function(done) {
          var codepoints;
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: false})
            .pipe(iconfont({
              fontName: 'iconsfont'
            })).on('glyphs', function(cpts) {
              codepoints = cpts;
            })
            .pipe(streamtest[version].toObjects(function(err, files) {
              neatequal(codepoints,
                JSON.parse(fs.readFileSync(
                  __dirname + '/expected/codepoints.json', 'utf8'))
              );
              done();
            }));
        });

      });

      describe('in buffer mode', function() {

        it('should work with iconsfont', function(done) {
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: true})
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff')
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.eot')
              );
              done();
            }));
        });

        it('should work with spawnWoff2 option', function(done) {
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: true})
            .pipe(iconfont({
              fontName: 'iconsfont',
              spawnWoff2: true,
              timestamp: generationTimestamp
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff')
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.eot')
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
              );
              done();
            }));
        });
    /* Unable to make it work locally
        it.only('should work with autohinted iconsfont', function(done) {
          gulp.src(__dirname+'/fixtures/iconsfont/*.svg', {buffer: true})
            .pipe(iconfont({
              fontName: 'iconsfont',
              autohint: true
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.ttf')
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff')
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.eot')
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(__dirname + '/expected/iconsfont.woff2')
              );
              done();
            }));
        });
    */

      });
    });

  });

});
