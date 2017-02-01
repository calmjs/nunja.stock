'use strict';

var core = require('nunja/core');
var utils = require('nunja/utils');
var $ = utils.$;

window.mocha.setup('bdd');

describe('nunja.stock.molds/navtree interactions', function() {
    beforeEach(function() {
        var data = require('nunja/stock/tests/fsnavtree_data');
        this.engine = core.engine;
        this.clock = sinon.useFakeTimers();
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;

        for (var key in data) {
            var target = '/script.py?' + key;
            this.server.respondWith('GET', target, function (xhr, id) {
                var s = JSON.stringify(data[key]);
                xhr.respond(200, {'Content-Type': 'application/json'}, s);
            });
        }

        // populate the body
        document.body.innerHTML = (
            '<div data-nunja="nunja.stock.molds/navtree"></div>');
        this.engine.populate($('div')[0], data['/']);
        this.clock.tick(500);

        // apply the onload trigger on the document body.
        this.engine.do_onload(document.body);
        this.clock.tick(500);
    });

    afterEach(function() {
        this.server.restore();
        this.clock.restore();
        document.body.innerHTML = "";
    });

    it('Click test', function() {
        expect($('a')[0].innerHTML).to.equal('dir');
        $('a')[0].click();
        this.clock.tick(500);
        expect($('a')[0].innerHTML).to.equal('nested');
        // should trigger error handling.
        $('a')[0].click();
        this.clock.tick(500);
    });

});
