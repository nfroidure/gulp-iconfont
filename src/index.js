'use strict';

const duplexer = require('plexer');
const svgicons2svgfont = require('gulp-svgicons2svgfont');
const cond = require('gulp-cond');
const filter = require('streamfilter');
const spawn = require('gulp-spawn');

function gulpFontIcon(options) {
  let inStream = null;
  let outStream = null;
  let duplexStream = null;

  options = options || {};
  options.formats = options.formats || ['ttf', 'eot', 'woff'];
  // Generating SVG font and saving her
  inStream = svgicons2svgfont(options);
  // Generating TTF font and saving her
  outStream = inStream
    .pipe(require('gulp-svg2ttf')({
      clone: -1 !== options.formats.indexOf('svg'),
      timestamp: options.timestamp,
    }).on('error', (err) => {
      outStream.emit('error', err);
    }))
    // TTFAutoHint
    .pipe(cond(!!options.autohint, () => {
      const hintPath = 'string' === typeof options.autohint ? options.autohint : 'ttfautohint';
      const nonTTFfilter = filter((file, unused, cb) => {
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
            `cat | "${hintPath}" --symbol --fallback-script=latn` +
              ' --windows-compatibility --no-info /dev/stdin /dev/stdout | cat',
          ],
        })).pipe(nonTTFfilter.restore)
      ).on('error', (err) => {
        outStream.emit('error', err);
      });
    }))
    // Generating EOT font
    .pipe(cond(
      -1 !== options.formats.indexOf('eot'),
      () => require('gulp-ttf2eot')({ clone: true }).on('error', (err) => {
        outStream.emit('error', err);
      })
    ))
    // Generating WOFF font
    .pipe(cond(
      -1 !== options.formats.indexOf('woff'),
      () => require('gulp-ttf2woff')({ clone: true }).on('error', (err) => {
        outStream.emit('error', err);
      })
    ))
    // Generating WOFF2 font
    .pipe(cond(
      -1 !== options.formats.indexOf('woff2'),
      () => require('gulp-ttf2woff2')({ clone: true }).on('error', (err) => {
        outStream.emit('error', err);
      })
    ))
    // Filter TTF font if necessary
    .pipe(cond(
      -1 === options.formats.indexOf('ttf'),
      () => filter((file, unused, cb) => {
        cb(file.path.indexOf('.ttf') === file.path.length - 4);
      }, {
        objectMode: true,
        passthrough: true,
      })
    ));

  duplexStream = duplexer({ objectMode: true }, inStream, outStream);

  // Re-emit codepoint mapping event
  inStream.on('glyphs', (glyphs) => {
    duplexStream.emit('glyphs', glyphs, options);
  });

  return duplexStream;
}

module.exports = gulpFontIcon;
