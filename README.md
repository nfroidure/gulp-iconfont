# gulp-iconfont
> Create a SVG/TTF/EOT/WOFF font from several SVG icons with [Gulp](http://gulpjs.com/).

[![NPM version](https://badge.fury.io/js/gulp-iconfont.png)](https://npmjs.org/package/gulp-iconfont) [![Build status](https://secure.travis-ci.org/nfroidure/gulp-iconfont.png)](https://travis-ci.org/nfroidure/gulp-iconfont) [![Dependency Status](https://david-dm.org/nfroidure/gulp-iconfont.png)](https://david-dm.org/nfroidure/gulp-iconfont) [![devDependency Status](https://david-dm.org/nfroidure/gulp-iconfont/dev-status.png)](https://david-dm.org/nfroidure/gulp-iconfont#info=devDependencies) [![Coverage Status](https://coveralls.io/repos/nfroidure/gulp-iconfont/badge.png?branch=master)](https://coveralls.io/r/nfroidure/gulp-iconfont?branch=master) [![Code Climate](https://codeclimate.com/github/nfroidure/gulp-iconfont.png)](https://codeclimate.com/github/nfroidure/gulp-iconfont)

You can test this library with the
 [frontend generator](http://nfroidure.github.io/svgiconfont/) before using
 her.

## Stats

[![NPM](https://nodei.co/npm/gulp-iconfont.png?downloads=true&stars=true)](https://nodei.co/npm/gulp-iconfont/)
[![NPM](https://nodei.co/npm-dl/gulp-iconfont.png)](https://nodei.co/npm/gulp-iconfont/)

## Usage

First, install `gulp-iconfont` as a development dependency:

```shell
npm install --save-dev gulp-iconfont
```

Then, add it to your `gulpfile.js`:

```javascript
var iconfont = require('gulp-iconfont');

gulp.task('Iconfont', function(){
  gulp.src(['assets/icons/*.svg'])
    .pipe(iconfont({
      fontName: 'myfont', // required
      appendCodepoints: true // recommended option
     }))
      .on('codepoints', function(codepoints, options) {
        // CSS templating, e.g.
        console.log(codepoints, options);
      })
    .pipe(gulp.dest('www/fonts/'));
});
```

`gulp-iconfont` bundles several plugins to bring a simpler API
 (`gulp-svgicons2svgfont`, `gulp-svg2tff`, `gulp-ttf2eot`, `gulp-ttf2woff`)
 for more flexibility, feel free to use them separately.

To use this font in your CSS, you could add a mixin like in this
 [real world example](https://github.com/ChtiJS/chtijs.francejs.org/blob/master/documents/less/_icons.less).
 You can also generate your CSS automatically with
 [`gulp-iconfont-scss`](https://github.com/backflip/gulp-iconfont-css).

You may also want to hint your TTF fonts, you can use `gulp-spawn`,
 `gulp-filter` and `ttfautohint` for that matter. First install `ttfautohint`
 (use at least the 0.93 version), then, in your gulpfile:
```js
var ttfFilter = filter('*.ttf');

  gulp.src(['assets/icons/*.svg'])
  .pipe(iconfont(/* ... */))
  .pipe(ttfFilter)
  .pipe(spawn({
    cmd: '/bin/sh',
    args: [
      '-c',
      'cat | ttfautohint /dev/stdin /dev/stdout | cat'
    ]
  }))
  .pipe(ttfFilter.restore())
  .pipe(gulp.dest('www/fonts/'))
```

## API

### iconfont(options)

#### options.fontName
Type: `String`
Default value: `'iconfont'`

A string value that is used to name your font-family (required).

#### options.fixedWidth
Type: `Boolean`
Default value: `false`

Creates a monospace font of the width of the largest input icon.

#### options.fontHeight
Type: `Number`

The ouputted font height (defaults to the height of the highest input icon).

#### options.descent
Type: `Number`
Default value: `0`

The font descent. It is usefull to fix the font baseline yourself.

The ascent formula is : ascent = fontHeight - descent.

#### options.appendCodepoints
Type: `Boolean`
Default value: `false`

Allow to append codepoints to icon files in order to always keep the same
 codepoints.

## Preparing SVG's

Beware that your SVG icons must have a high enough height. 500 is a minimum. If
 you do not want to resize them, you can try to combine the `fontHeight` and
 the `normalize` option to get them in a correct size.

### Inkscape
Degroup every shapes (Ctrl+Shift+G), convert to pathes (Ctrl+Maj+C)  and merge
 them (Ctrl++). Then save you SVG, prefer 'simple SVG' file type.

### Illustrator

Save your file as SVG with the following settings:

- SVG Profiles: SVG 1.1
- Fonts Type: SVG
- Fonts Subsetting: None
- Options Image Location: Embed
- Advanced Options
  - CSS Properties: Presentation Attributes
  - Decimal Places: 1
  - Encoding: UTF-8
  - Output fewer <tspan> elements: check

Leave the rest unchecked.

More in-depth information: [http://www.adobe.com/inspire/2013/09/exporting-svg-illustrator.html](http://www.adobe.com/inspire/2013/09/exporting-svg-illustrator.html)
