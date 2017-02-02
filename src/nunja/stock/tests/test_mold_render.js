'use strict';

var core = require('nunja/core');
window.mocha.setup('bdd');

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

    it('Null rendering', function() {
        var results = this.engine.render('nunja.stock.molds/navtree', {
            'active_columns': [],
            'column_map': {},
            'data': [],
            'css': {},
        });

        expect(results).to.equal(
            '<div data-config="">\n' +
            '<table class="">\n' +
            '  <thead>\n' +
            '    <tr class="">\n' +
            '    \n' +
            '    </tr>\n' +
            '  </thead>\n' +
            '  <tbody>\n' +
            '    \n' +
            '  </tbody>\n' +
            '</table>\n' +
            '\n' +
            '</div>\n'
        )
    });

});

