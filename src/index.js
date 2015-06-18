var gutil = require('gulp-util');
var duplexer = require('plexer');
var svgicons2svgfont = require('gulp-svgicons2svgfont');
var svg2ttf = require('gulp-svg2ttf');
var ttf2eot = require('gulp-ttf2eot');
var ttf2woff = require('gulp-ttf2woff');
var cond = require('gulp-cond');
var filter = require('streamfilter');
var spawn = require('gulp-spawn');
var rename = require('gulp-rename');
var clone = require('gulp-clone');

function gulpFontIcon(options) {
  options = options || {};
  options.autohint = !!options.autohint;
  // Generating SVG font and saving her
  var inStream = svgicons2svgfont(options);
  inStream.on('error', function (error) {
    inStream.emit('end');
  });
  // Generating TTF font and saving her
  var outStream = inStream.pipe(svg2ttf({clone: true}))
  // TTFAutoHint
    .pipe(cond(options.autohint, function () {
      var nonTTFfilter = filter(function(file, unused, cb) {
        cb(file.path.indexOf('.ttf') !== file.path.length - 4);
      }, {
        objectMode: true,
        restore: true,
        passthrough: true
      });
      return duplexer(
        {objectMode: true},
        nonTTFfilter,
        nonTTFfilter.pipe(spawn({
          cmd: '/bin/sh',
          args: [
            '-c',
            'cat | ttfautohint --symbol --fallback-script=latn --windows-compatibility --no-info /dev/stdin /dev/stdout | cat'
          ]
        })).pipe(nonTTFfilter.restore)
      );
    }))
  // Generating EOT font
    .pipe(ttf2eot({clone: true}))
  // Generating WOFF font
    .pipe(ttf2woff({clone: true}))
  // Generating WOFF2 font
    .pipe(cond(options.woff2, function () {
      var nonTTFfilter = filter(function(file, unused, cb) {
        cb(file.path.indexOf('.ttf') !== file.path.length - 4);
      }, {
        objectMode: true,
        restore: true,
        passthrough: true
      });
      var cloneSink = clone.sink();
      return duplexer(
        {objectMode: true},
        nonTTFfilter,
        nonTTFfilter
          .pipe(cloneSink)
          .pipe(spawn({
            cmd: '/bin/sh',
            args: [
              '-c',
              'cat | woff2_compress /dev/stdin /dev/stdout | cat'
            ]
          }))
          .pipe(rename({
            extname: ".woff2"
          }))
          .pipe(cloneSink.tap())
          .pipe(nonTTFfilter.restore)
      );
    }));

  var duplex = duplexer({objectMode: true}, inStream, outStream);

  // Re-emit codepoint mapping event
  inStream.on('glyphs', function(glyphs) {
    duplex.emit('glyphs', glyphs, options);
  });

  // Re-emit glyph mapping event
  inStream.on('glyph', function(glyph) {
    duplex.emit('glyph', glyph, options);
  });

  return duplex;
}

module.exports = gulpFontIcon;
