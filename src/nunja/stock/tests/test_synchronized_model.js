// This test module uses sources that are shared with the tests for the
// Python server-side component; the Python test should have verified
// that the JSON inputs here as outputs the library generates.

// This test is written using requirejs async due to current module
// load order for modules declared in the test registry.  Perhaps all
// modules not starting with "test" be preloaded by calmjs.rjs.dev to
// avoid this.

define(['text!nunja/stock/tests/fsnavtree_examples.js'], function() {
    'use strict';

    window.mocha.setup('bdd');

    var core = require('nunja/core');

    describe('Basic nunja.stock.molds/navtree rendering', function() {
        beforeEach(function() {
            this.clock = sinon.useFakeTimers();
            this.engine = core.engine;

            /*
            // A barebone mock scaffold that should be enough to trigger
            // the loading and compilation of the template into memory,
            // if it's not there already.
            document.body.innerHTML = (
                '<div data-nunja="nunja.molds/table"></div>');
            this.engine.do_onload(document.body);
            this.clock.tick(500);
            */
        });

        afterEach(function() {
            this.clock.restore();
            document.body.innerHTML = "";
        });

        it('Linked rendering with Python', function() {
            var s = require('text!nunja/stock/tests/fsnavtree_examples.js');
            var d = JSON.parse(s)[0];
            var results = this.engine.execute('nunja.stock.molds/navtree', d);

            expect(results).to.equal(
                '<div data-nunja="nunja.stock.molds/navtree">\n' +
                '<table class="">\n' +
                '  <thead>\n' +
                '    <tr class="">\n' +
                '    <td>name</td><td>type</td><td>size</td>\n' +
                '    </tr>\n' +
                '  </thead>\n' +
                '  <tbody>\n' +
                '    <tr class="">\n' +
                '      <td><a href="/script.py?/dummydir2/file1">file1</a></td><td>file</td><td>13</td>\n' +
                '    </tr><tr class="">\n' +
                '      <td><a href="/script.py?/dummydir2/file2">file2</a></td><td>file</td><td>13</td>\n' +
                '    </tr>\n' +
                '  </tbody>\n' +
                '</table>\n' +
                '\n' +
                '</div>\n'
            );

        });

    });

});
