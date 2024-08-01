import { describe, test, expect, jest } from '@jest/globals';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import StreamTest from 'streamtest';
// import gulp from 'gulp';
import gulpIconFont from './index.js';
import type Vinyl from 'vinyl';

describe('gulp-iconfont', () => {
  const generationTimestamp = 3;

  describe('in stream mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        timestamp: generationTimestamp,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(3);

      await Promise.all(
        ['iconsfont.ttf', 'iconsfont.woff', 'iconsfont.eot'].map(
          async (filename, index) => {
            const [contentStream, contentResult] = StreamTest.toChunks();

            (files[index].contents as Readable).pipe(contentStream);

            expect(Buffer.concat(await contentResult)).toEqual(
              await readFile(join('fixtures', 'expected', filename)),
            );
          },
        ),
      );
    });

    test('should work for only one font', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        timestamp: generationTimestamp,
        formats: ['woff'],
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);

      await Promise.all(
        ['iconsfont.woff'].map(async (filename, index) => {
          const [contentStream, contentResult] = StreamTest.toChunks();

          (files[index].contents as Readable).pipe(contentStream);

          expect(Buffer.concat(await contentResult)).toEqual(
            await readFile(join('fixtures', 'expected', filename)),
          );
        }),
      );
    });

    test('should output SVG font with svg added to formats', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      jest.setTimeout(5000);

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        formats: ['svg', 'ttf', 'eot', 'woff'],
        timestamp: generationTimestamp,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(4);

      await Promise.all(
        [
          'iconsfont.svg',
          'iconsfont.ttf',
          'iconsfont.woff',
          'iconsfont.eot',
        ].map(async (filename, index) => {
          const [contentStream, contentResult] = StreamTest.toChunks();

          (files[index].contents as Readable).pipe(contentStream);

          expect(Buffer.concat(await contentResult)).toEqual(
            await readFile(join('fixtures', 'expected', filename)),
          );
        }),
      );
    });

    test('should output WOFF2 font with woff2 added to formats', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      jest.setTimeout(5000);

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        formats: ['ttf', 'woff', 'woff2'],
        timestamp: generationTimestamp,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(3);

      await Promise.all(
        ['iconsfont.ttf', 'iconsfont.woff2', 'iconsfont.woff'].map(
          async (filename, index) => {
            const [contentStream, contentResult] = StreamTest.toChunks();

            (files[index].contents as Readable).pipe(contentStream);

            expect(Buffer.concat(await contentResult)).toEqual(
              await readFile(join('fixtures', 'expected', filename)),
            );
          },
        ),
      );
    });

    test('should emit an event with the codepoint mapping', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      const [codepoints, files] = await Promise.all([
        new Promise<unknown>((resolve, reject) => {
          gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
            fontName: 'iconsfont',
            timestamp: generationTimestamp,
          })
            .on('glyphs', (codepoints) => {
              resolve(codepoints);
            })
            .on('error', reject)
            .pipe(stream);
        }),
        result,
      ]);

      expect(files.length).toEqual(3);
      expect(codepoints).toEqual(
        JSON.parse(
          await readFile(
            join('fixtures', 'expected', 'codepoints.json'),
            'utf8',
          ),
        ),
      );
    });

    test('should work with autohinted iconsfont', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      jest.setTimeout(10000);

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        timestamp: generationTimestamp,
        autohint: `bin/ttfautohint/ttfautohint.sh`,
        formats: ['ttf'],
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(1);

      const [contentStream, contentResult] = StreamTest.toChunks();

      (files[0].contents as Readable).pipe(contentStream);

      const contents = Buffer.concat(await contentResult);
      const expected = await readFile(
        join('fixtures', 'expected', 'hinted', 'iconsfont.ttf'),
      );

      // Clear the flags that change between invocations
      contents.writeUInt8(0, 0x0080);
      expected.writeUInt8(0, 0x0080);
      contents.writeUInt8(0, 0x0081);
      expected.writeUInt8(0, 0x0081);
      contents.writeUInt8(0, 0x0082);
      expected.writeUInt8(0, 0x0082);
      contents.writeUInt8(0, 0x0083);
      expected.writeUInt8(0, 0x0083);

      contents.writeUInt8(0, 0x71a);
      expected.writeUInt8(0, 0x71a);
      contents.writeUInt8(0, 0x71b);
      expected.writeUInt8(0, 0x71b);

      contents.writeUInt8(0, 0x732);
      expected.writeUInt8(0, 0x732);
      contents.writeUInt8(0, 0x733);
      expected.writeUInt8(0, 0x733);

      expect(contents).toEqual(expected);
    });
  });

  // Buffer mode not supported by `gulp-svgicons2svgfont1 atm
  describe.skip('in buffer mode', () => {
    test('should work', async () => {
      const [stream, result] = StreamTest.toObjects<Vinyl>();

      gulpIconFont(join('fixtures', 'iconsfont', '*.svg'), {
        fontName: 'iconsfont',
        timestamp: generationTimestamp,
      }).pipe(stream);

      const files = await result;

      expect(files.length).toEqual(3);

      expect(files[0].contents).toEqual(
        await readFile(join('fixtures', 'expected', 'iconsfont.ttf')),
      );
      expect(files[1].contents).toEqual(
        await readFile(join('fixtures', 'expected', 'iconsfont.woff')),
      );
      expect(files[2].contents).toEqual(
        await readFile(join('fixtures', 'expected', 'iconsfont.eot')),
      );
    });
  });
});
