// This test module uses sources that are shared with the tests for the
// Python server-side component; the Python test should have verified
// that the JSON inputs here as outputs the library generates.

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
        var data = require('nunja/stock/tests/fsnavtree_examples');
        var datum = data[0];
        var results = this.engine.execute(
            'nunja.stock.molds/navtree', datum[0]);
        var rendered = results.split('\n').filter(function(v) {
            return v.length > 0;
        }).join('\n');
        expect(rendered).to.equal(datum[1].join('\n'));
    });

    it('Linked rendering with Python, with data-href', function() {
        var data = require('nunja/stock/tests/fsnavtree_examples');
        var datum = data[1];
        var results = this.engine.execute(
            'nunja.stock.molds/navtree', datum[0]);
        var rendered = results.split('\n').filter(function(v) {
            return v.length > 0;
        }).join('\n');
        expect(rendered).to.equal(datum[1].join('\n'));
    });

});
