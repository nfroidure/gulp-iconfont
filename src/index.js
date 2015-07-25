'use strict';

var duplexer = require('plexer');
var svgicons2svgfont = require('gulp-svgicons2svgfont');
var svg2ttf = require('gulp-svg2ttf');
var ttf2eot = require('gulp-ttf2eot');
var ttf2woff = require('gulp-ttf2woff');
var ttf2woff2 = require('gulp-ttf2woff2');
var cond = require('gulp-cond');
var filter = require('streamfilter');
var spawn = require('gulp-spawn');
var rename = require('gulp-rename');
var clone = require('gulp-clone');

function gulpFontIcon(options) {
  var inStream = null;
  var outStream = null;
  var duplexStream = null;

  options = options || {};
  options.autohint = !!options.autohint;
  options.svg = 'boolean' === typeof options.svg ? options.svg : false;
  // Generating SVG font and saving her
  inStream = svgicons2svgfont(options);
  // Generating TTF font and saving her
  outStream = inStream
    .pipe(svg2ttf({
      clone: options.svg,
      timestamp: options.timestamp,
    }).on('error', function(err) {
      outStream.emit('error', err);
    }))
  // TTFAutoHint
    .pipe(cond(options.autohint, function() {
      var nonTTFfilter = filter(function(file, unused, cb) {
        cb(file.path.indexOf('.ttf') !== file.path.length - 4);
      }, {
        objectMode: true,
        restore: true,
        passthrough: true,
      });

      return duplexer(
        { objectMode: true },
        nonTTFfilter,
        nonTTFfilter.pipe(spawn({
          cmd: '/bin/sh',
          args: [
            '-c',
            'cat | ttfautohint --symbol --fallback-script=latn' +
              ' --windows-compatibility --no-info /dev/stdin /dev/stdout | cat',
          ],
        })).pipe(nonTTFfilter.restore)
      ).on('error', function(err) {
        outStream.emit('error', err);
      });
    }))
  // Generating EOT font
    .pipe(ttf2eot({ clone: true }).on('error', function(err) {
      outStream.emit('error', err);
    }))
  // Generating WOFF font
    .pipe(ttf2woff({ clone: true }).on('error', function(err) {
      outStream.emit('error', err);
    }))
  // Generating WOFF2 font
    .pipe(cond(options.spawnWoff2, function() {
      var nonTTFfilter = filter(function(file, unused, cb) {
        cb(file.path.indexOf('.ttf') !== file.path.length - 4);
      }, {
        objectMode: true,
        restore: true,
        passthrough: true,
      });
      var cloneSink = clone.sink();

      return duplexer(
        { objectMode: true },
        nonTTFfilter,
        nonTTFfilter
          .pipe(cloneSink)
          .pipe(spawn({
            cmd: '/bin/sh',
            args: [
              '-c',
              'cat | woff2_compress /dev/stdin /dev/stdout | cat',
            ],
          }))
          .pipe(rename({
            extname: '.woff2',
          }))
          .pipe(cloneSink.tap())
          .pipe(nonTTFfilter.restore)
      );
    }, function() {
      return ttf2woff2({ clone: true }).on('error', function(err) {
        outStream.emit('error', err);
      });
    }));

  duplexStream = duplexer({ objectMode: true }, inStream, outStream);

  // Re-emit codepoint mapping event
  inStream.on('glyphs', function(glyphs) {
    duplexStream.emit('glyphs', glyphs, options);
  });

  return duplexStream;
}

module.exports = gulpFontIcon;
