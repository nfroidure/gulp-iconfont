import type Vynil from 'vinyl';
import multipipe from 'multipipe';
import {
  svgicons2svgfont,
  type SVGIcons2SVGFontOptions,
} from 'gulp-svgicons2svgfont';
import { filterStream } from 'streamfilter';
import spawn from 'gulp-spawn';
import svg2ttf from 'gulp-svg2ttf';
import ttf2eot from 'gulp-ttf2eot';
import ttf2woff from 'gulp-ttf2woff';
import ttf2woff2 from 'gulp-ttf2woff2';

export type GulpIconFontOptions = {
  formats: ('ttf' | 'eot' | 'woff' | 'woff2' | 'svg')[];
  clone: boolean;
  autohint: boolean | string;
  timestamp: number;
};

function gulpIconFont(
  glob: string | string[],
  options: Partial<GulpIconFontOptions> & SVGIcons2SVGFontOptions,
) {
  options = options || {};
  options.formats = options.formats || ['ttf', 'eot', 'woff'];
  options.clone = -1 !== options.formats.indexOf('svg');
  options.timestamp = options.timestamp || Math.round(Date.now() / 1000);

  // Generating SVG font and saving her
  const svgicons2svgfontStream = svgicons2svgfont(glob, options);
  // Generating TTF font and saving it
  const result = multipipe(
    [
      svgicons2svgfontStream,
      svg2ttf(options),
      !!options.autohint &&
        (() => {
          const hintPath =
            'string' === typeof options.autohint
              ? options.autohint
              : 'ttfautohint';
          const nonTTFfilter = filterStream(
            (file: Vynil, _, cb) => {
              cb(file.path.indexOf('.ttf') !== file.path.length - 4);
            },
            {
              objectMode: true,
              restore: true,
              passthrough: true,
            },
          );

          return multipipe(
            nonTTFfilter,
            spawn({
              cmd: '/bin/sh',
              args: [
                '-c',
                `cat | "${hintPath}" --symbol --fallback-script=latn` +
                  ' --windows-compatibility --no-info /dev/stdin /dev/stdout | cat',
              ],
            }),
            nonTTFfilter.restore,
          );
        })(),
      -1 !== options.formats.indexOf('eot') && ttf2eot({ clone: true }),
      -1 !== options.formats.indexOf('woff') && ttf2woff({ clone: true }),
      -1 !== options.formats.indexOf('woff2') && ttf2woff2({ clone: true }),
      -1 === options.formats.indexOf('ttf') &&
        filterStream(
          (file: Vynil, _, cb) => {
            cb(file.path.indexOf('.ttf') === file.path.length - 4);
          },
          {
            objectMode: true,
            passthrough: true,
          },
        ),
    ].filter((x) => x),
  );

  // Re-emit codepoint mapping event
  svgicons2svgfontStream.on('glyphs', (glyphs) => {
    result.emit('glyphs', glyphs, options);
  });

  return result;
}

export default gulpIconFont;
