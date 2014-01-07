var gutil = require('gulp-util')
  , Stream = require('stream')
  , duplexer = require('duplexer')
  , svgicons2svgfont = require('gulp-svgicons2svgfont')
  , svg2ttf = require('gulp-svg2ttf')
  , ttf2eot = require('gulp-ttf2eot')
  , ttf2woff = require('gulp-ttf2woff')
;

function group() {
  var pass = new Stream.PassThrough({objectMode: true});

  // Mapping given streams
  var streams = [].slice.call(arguments,0).map(function(stream) {
    // Listening to streams datas
    stream.on('data', function(file) {
      pass.write(file);
    });
    // Listening to streams end
    stream.once('end', function() {
      streams.splice(streams.indexOf(stream), 1);
      if(!streams.length) {
        pass.end();
      }
    });
    return stream;
  });

  return pass;
  
}

function throughs() {

  var trans = new Stream.Transform({objectMode: true});

  // Repeat content to each stream
  trans._transform = function (file, unused, cb) {
    streams.forEach(function(stream) {
      stream.write(file.clone());
    });
    trans.push(file);
    cb();
  };

  // Ending all through streams when flushing
  trans._flush = function (cb) {
    streams.forEach(function(stream) {
      stream.end();
    });
    cb();
  };

  // Mapping given streams
  var streams = [].slice.call(arguments,0).map(function(stream) {
    // Listening to streams datas
    stream.on('data', function(file) {
      trans.push(file);
    });
    return stream;
  });

  return trans;

}

function explode() {

  var trans = new Stream.Transform({objectMode: true});

  // Repeat content to each stream
  trans._transform = function (file, unused, cb) {
    streams.forEach(function(stream) {
      stream.write(file.clone());
    });
    trans.push(file);
    cb();
  };

  // Ending all through streams when flushing
  trans._flush = function (cb) {
    streams.forEach(function(stream) {
      stream.end();
    });
    cb();
  };

  // Mapping given streams
  var streams = [].slice.call(arguments,0).map(function(stream) {
    return stream;
  });

  return trans;

}

function gulpFontIcon(options) {
  var svgOut = new Stream.PassThrough({objectMode: true});
  var ttfOut = new Stream.PassThrough({objectMode: true});
  var consumer = new Stream.PassThrough({objectMode: true});

  // Generating SVG font and saving her
  var svg = svgicons2svgfont(options);
  var main = svg.pipe(explode(svgOut))
  // Generating TTF font and saving her
    .pipe(svg2ttf())
  // Generation EOT and WOFF fonts
    .pipe(throughs(ttf2eot(), ttf2woff()));

  return duplexer(svg, group(svgOut, main));

}

module.exports = gulpFontIcon;
