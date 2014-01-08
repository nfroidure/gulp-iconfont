# gulp-iconfont [![NPM version](https://badge.fury.io/js/gulp-iconfont.png)](https://npmjs.org/package/gulp-iconfont) [![Build status](https://api.travis-ci.org/nfroidure/gulp-iconfont.png)](https://travis-ci.org/nfroidure/gulp-iconfont)
> Create a SVG/TTF/EOT/WOFF font from several SVG icons with [Gulp](http://gulpjs.com/).

You can test this library with the
 [frontend generator](http://nfroidure.github.io/svgiconfont/) before using
 her.

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
      appendCodepoints: true // recommanded option
     }))
    .pipe(gulp.dest('www/fonts/'));
});
```

`gulp-iconfont` bundles several plugins to bring a simpler API
 (`gulp-svgicons2svgfont`, `gulp-svg2tff`, `gulp-ttf2eot`, `gulp-ttf2woff`).

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
