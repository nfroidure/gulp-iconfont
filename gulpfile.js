'use strict';

var fs = require('fs');

var gulp = require('gulp');
var iconfont = require('gulp-iconfont');

var fonts = fs.readdirSync(__dirname + '/fonts');


fonts.forEach(function(font) {
	var info = require('./fonts/' + font + '/info');
	var defaultMetadataProvider = require('svgicons2svgfont/src/metadata')();
	function metadataProvider(path, callback) {
		defaultMetadataProvider(path, function(error, metadata) {
			if('ligatures' in info && metadata.name in info.ligatures) {
				info.ligatures[metadata.name].forEach(function(ligature) {
					if(metadata.unicode.indexOf(ligature) === -1) {
						metadata.unicode.push(ligature);
					}
				});
			}
			callback(error, metadata);
		});
	}
	gulp.task(font, function() {
		gulp.src(['fonts/' + font + '/*.svg'])
		.pipe(iconfont({
			fontName: info.name, // required
			appendCodepoints: true, // recommended option
			fontHeight: info.fontHeight,
			normalize: !!info.normalize,
			formats: ['svg', 'ttf', 'eot', 'woff', 'woff2'],
			round: 100,
			metadataProvider: metadataProvider
		}))
		.pipe(gulp.dest(info.destination));
	});
});

gulp.task('default', fonts);
