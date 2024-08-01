#!/bin/bash

mkdir -p fixtures/expected/hinted \
&& ./node_modules/svgicons2svgfont/bin/svgicons2svgfont.js -f iconsfont fixtures/iconsfont/* > fixtures/expected/iconsfont.svg \
&& ./node_modules/svg2ttf/svg2ttf.js --ts 3 fixtures/expected/iconsfont.svg fixtures/expected/iconsfont.ttf \
&& ( \
	cat fixtures/expected/iconsfont.ttf \
	| ./bin/ttfautohint/ttfautohint.sh --symbol --fallback-script=latn --windows-compatibility --no-info \
	> fixtures/expected/hinted/iconsfont.ttf\
) \
&& ./node_modules/ttf2eot/ttf2eot.js fixtures/expected/iconsfont.ttf fixtures/expected/iconsfont.eot \
&& ./node_modules/ttf2woff/ttf2woff.js fixtures/expected/iconsfont.ttf fixtures/expected/iconsfont.woff \
&& (cat fixtures/expected/iconsfont.ttf | node ./node_modules/ttf2woff2/bin/ttf2woff2.js > fixtures/expected/iconsfont.woff2)
