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

function gulpFontIcon(options) {
  var inStream = null;
  var outStream = null;
  var duplexStream = null;

  options = options || {};
  options.autohint = !!options.autohint;
  options.formats = options.formats || ['ttf', 'eot', 'woff'];
  // Generating SVG font and saving her
  inStream = svgicons2svgfont(options);
  // Generating TTF font and saving her
  outStream = inStream
    .pipe(svg2ttf({
      clone: -1 !== options.formats.indexOf('svg'),
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
    .pipe(cond(
      -1 !== options.formats.indexOf('eot'),
      function() {
        return ttf2eot({ clone: true }).on('error', function(err) {
          outStream.emit('error', err);
        });
      }
    ))
  // Generating WOFF font
    .pipe(cond(
      -1 !== options.formats.indexOf('woff'),
      function() {
        return ttf2woff({ clone: true }).on('error', function(err) {
          outStream.emit('error', err);
        });
      }
    ))
  // Generating WOFF2 font
    .pipe(cond(
      -1 !== options.formats.indexOf('woff2'),
      function() {
        return ttf2woff2({ clone: true }).on('error', function(err) {
          outStream.emit('error', err);
        });
      }
    ))
  // Filter TTF font if necessary
    .pipe(cond(
      -1 === options.formats.indexOf('ttf'),
      function() {
        return filter(function(file, unused, cb) {
          cb(file.path.indexOf('.ttf') === file.path.length - 4);
        }, {
          objectMode: true,
          passthrough: true,
        });
      }
    ));

  duplexStream = duplexer({ objectMode: true }, inStream, outStream);

  // Re-emit codepoint mapping event
  inStream.on('glyphs', function(glyphs) {
    duplexStream.emit('glyphs', glyphs, options);
  });

  return duplexStream;
}

module.exports = gulpFontIcon;
