/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast-include
 * @fileoverview Test suite for `hast-include`.
 */

'use strict';

/* eslint-env node */

/*
 * Dependencies.
 */

var path = require('path');
var test = require('tape');
var toVFile = require('to-vfile');
var VFile = require('vfile');
var hast = require('hast');
var include = require('..');

var join = path.join.bind(null, 'test', 'fixtures');
var processor = hast().use(include);

/*
 * Tests.
 */

test('include', function (t) {
    var file;
    var doc;

    t.plan(13);

    t.throws(function () {
        processor.process('');
    }, 'Expected file-path in vfile')

    file = new VFile();
    file.quiet = true;
    processor.process(file, function (err) {
        t.equal(String(err), '1:1: Expected file-path in vfile, got empty string');
    });

    file = toVFile.readSync(join('no-import', 'index.html'));
    doc = file.toString();

    t.deepEqual(processor.process(file), doc);

    processor.process(toVFile.readSync(join('no-src', 'index.html')), function (err, file) {
        t.ifErr(err);
        t.deepEqual(file.messages.map(String), [
            'test/fixtures/no-src/index.html:8:5-8:16: Cannot import without `src`'
        ]);
    });

    processor.process(toVFile.readSync(join('self', 'index.html')), function (err, file) {
        t.ifErr(err);
        t.deepEqual(file.messages.map(String), [
            'test/fixtures/self/index.html:8:5-8:35: Cannot import recursivly'
        ]);
    });

    processor.process(toVFile.readSync(join('invalid', 'index.html')), function (err, file) {
        t.ifErr(err);
        t.deepEqual(file.messages.map(String), [
            'test/fixtures/invalid/index.html:8:5-8:37: Could not import src: ENOENT: \'test/fixtures/invalid/invalid.html\''
        ]);
    });

    processor.process(toVFile.readSync(join('valid', 'index.html')), function (err, file, doc) {
        t.ifErr(err);
        t.equal(doc, [
            '<!DOCTYPE html>',
            '<html>',
            '  <head>',
            '    <meta charset="utf-8">',
            '    <title>Hello</title>',
            '  </head>',
            '  <body>',
            '    <h1>Foo!</h1>',
            '',
            '    <p>Baz!</p>',
            '<p>And some more baz.</p>',
            '',
            '    <p>World 👍</p>',
            '    <p>Qux!</p>',
            '<p>Quux.</p>',
            '<p>Index.</p>',
            '',
            '  </body>',
            '</html>',
            ''
        ].join('\n'))
    });

    hast().use(include).use(function () {
        return function (ast, file) {
            if (file.filename === 'foo') {
                file.fail('Beep Boop!');
            }
        }
    }).process(toVFile.readSync(join('valid', 'index.html')), function (err, file) {
        t.ifErr(err);
        t.deepEqual(file.messages.map(String), [
            'test/fixtures/valid/index.html:8:5-8:31: Could not process src: Beep Boop!'
        ]);
    });
});
