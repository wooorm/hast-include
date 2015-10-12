/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module hast-include
 * @fileoverview Include HTML fragments.
 */

'use strict';

/* eslint-env commonjs */

/*
 * Dependencies.
 */

var url = require('url');
var toVFile = require('to-vfile');
var visit = require('unist-util-visit');

/*
 * Constants.
 */

var TAG_NAME = 'x-include';

/**
 * Add a doctype to a document, if not already existing.
 *
 * @param {Hast} processor - Processor.
 * @return {Function} - Transformer.
 */
function attacher(processor) {
    /*
     * Ensure `include` is seen as a void-element.
     */

    processor.data.voids[TAG_NAME] = true;

    /**
     * Add a doctype to a document, if not already existing.
     * When adding, adds a doctype based for the given
     * doctype name (defaulting to `5`).
     *
     * @param {Node} tree - hast root node.
     * @param {VFile} file - Virtual file.
     */
    return function (tree, file, next) {
        var filePath = file.filePath();
        var count = 0;

        if (!filePath) {
            next(file.fail('Expected file-path in vfile, got empty string'));
            return;
        }

        /** Invoke `next` when `count` is `0`. */
        function one() {
            if (!count) {
                next();
            }
        }

        visit(tree, 'element', function (node, index, parent) {
            var src;

            if (node.tagName !== TAG_NAME) {
                return;
            }

            src = node.properties.src;

            /*
             * Warn when without `src`.
             */

            if (!src) {
                file.warn('Cannot import without `src`', node);

                return;
            }

            src = url.resolve(filePath, src);

            /*
             * Warn when attempting to import self.
             */

            if (src === filePath) {
                file.warn('Cannot import recursivly', node);

                return;
            }

            count++;

            toVFile.read(src, function (err, doc) {
                /*
                 * Warn when import failed.
                 */

                if (err) {
                    file.warn('Could not import src: ' + err.message, node);

                    count--;
                    one();

                    return;
                }

                processor.parse(doc);

                processor.run(doc, function (err, tree) {
                    /*
                     * A previous sibling importing several
                     * nodes could have offset the index,
                     * thus we check again.
                     */

                    var siblings = parent.children;

                    index = siblings.indexOf(node);

                    /*
                     * Warn when import failed.
                     */

                    if (err) {
                        file.warn(
                            'Could not process src: ' + err.message, node
                        );
                    } else {
                        parent.children = siblings.slice(0, index).concat(
                            tree.children,
                            siblings.slice(index + 1)
                        );
                    }

                    count--;
                    one();
                });
            });
        });

        one();
    };
}

/*
 * Expose.
 */

module.exports = attacher;
