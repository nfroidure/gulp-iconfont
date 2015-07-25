'use strict';

var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var iconfont = require('../src/index');
var assert = require('assert');
var neatequal = require('neatequal');
var streamtest = require('streamtest');

describe('gulp-iconfont', function() {
  var generationTimestamp = 3;

  streamtest.versions.forEach(function(version) {
    describe('for ' + version + ' streams', function() {

      describe('in stream mode', function() {

        it('should output SVG font with svg option to true', function(done) {
          var contents = [];
          var processedFiles = 0;

          this.timeout(5000);
          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg'), { buffer: false })
            .pipe(iconfont({
              fontName: 'iconsfont',
              svg: true,
              timestamp: generationTimestamp,
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              files.forEach(function(file, index) {
                file.contents.pipe(streamtest[version].toChunks(function(err2, chunks) {
                  if(err2) {
                    return done(err2);
                  }
                  contents[index] = Buffer.concat(chunks);
                  processedFiles++;
                  if(processedFiles === files.length) {
                    assert.deepEqual(
                      contents[0],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.svg'))
                    );
                    assert.deepEqual(
                      contents[1],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.ttf'))
                    );
                    assert.deepEqual(
                      contents[2],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff2'))
                    );
                    assert.deepEqual(
                      contents[3],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff'))
                    );
                    assert.deepEqual(
                      contents[4],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.eot'))
                    );
                    done();
                  }
                }));
              });
            }));
        });

        it('should work with iconsfont', function(done) {
          var contents = [];
          var processedFiles = 0;

          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg'), { buffer: false })
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp,
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              files.forEach(function(file, index) {
                file.contents.pipe(streamtest[version].toChunks(function(err2, chunks) {
                  if(err2) {
                    return done(err2);
                  }
                  contents[index] = Buffer.concat(chunks);
                  processedFiles ++;
                  if(processedFiles === files.length) {
                    assert.deepEqual(
                      contents[0],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.ttf'))
                    );
                    assert.deepEqual(
                      contents[1],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff2'))
                    );
                    assert.deepEqual(
                      contents[2],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff'))
                    );
                    assert.deepEqual(
                      contents[3],
                      fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.eot'))
                    );
                    done();
                  }
                }));
              });
            }));
        });

      });

      describe('in buffer mode', function() {

        it('should work with iconsfont', function(done) {
          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg'), { buffer: true })
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp,
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.ttf'))
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff2'))
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff'))
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.eot'))
              );
              done();
            }));
        });

        it('should work with spawnWoff2 option', function(done) {
          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg'), { buffer: true })
            .pipe(iconfont({
              fontName: 'iconsfont',
              spawnWoff2: true,
              timestamp: generationTimestamp,
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.ttf'))
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff'))
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.eot'))
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff2'))
              );
              done();
            }));
        });

        it('should emit an event with the codepoint mapping', function(done) {
          var codepoints;

          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg'), { buffer: true })
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp,
            })).on('glyphs', function(_codepoints_) {
              codepoints = _codepoints_;
            })
            .pipe(streamtest[version].toObjects(function(err) {
              if(err) {
                return done(err);
              }
              neatequal(codepoints,
                JSON.parse(fs.readFileSync(
                  path.join(__dirname, 'expected', 'codepoints.json'), 'utf8'))
              );
              done();
            }));
        });
    /* Unable to make it work locally
        it.only('should work with autohinted iconsfont', function(done) {
          gulp.src(path.join(__dirname, 'fixtures', 'iconsfont', '*.svg', { buffer: true })
            .pipe(iconfont({
              fontName: 'iconsfont',
              timestamp: generationTimestamp,
              autohint: true,
            }))
            .pipe(streamtest[version].toObjects(function(err, files) {
              if(err) {
                return done(err);
              }
              assert.deepEqual(
                files[0].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.ttf'))
              );
              assert.deepEqual(
                files[1].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff'))
              );
              assert.deepEqual(
                files[2].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.eot'))
              );
              assert.deepEqual(
                files[3].contents,
                fs.readFileSync(path.join(__dirname, 'expected', 'iconsfont.woff2'))
              );
              done();
            }));
        });
    */

      });
    });

  });

});
