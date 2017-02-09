'use strict';

var core = require('nunja/core');
var utils = require('nunja/utils');
var $ = utils.$;

var markers = {};
var data = require('nunja/stock/tests/fsnavtree_data');

window.mocha.setup('bdd');

describe('nunja.stock.molds/navtree interactions', function() {

    var defaultPopulate = function(test, path) {
        path = path || '/';
        // populate the body
        var div = document.createElement('div');
        div.innerHTML = '<div data-nunja="nunja.stock.molds/navtree"></div>';
        test.engine.populate($('div', div)[0], data[path]);
        document.body.appendChild(div);
        test.clock.tick(500);
    };

    var triggerOnLoad = function(test) {
        // apply the onload trigger on the document body.
        test.engine.do_onload(document.body);
        test.clock.tick(500);
    };

    beforeEach(function() {
        this.engine = core.engine;
        this.clock = sinon.useFakeTimers();
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;

        for (var key in data) {
            var target = '/script.py?' + key;
            this.server.respondWith('GET', target, function (xhr) {
                var s = JSON.stringify(data[key]);
                xhr.respond(200, {'Content-Type': 'application/json'}, s);
            });
        }

        this.server.respondWith('GET', '/bad_target', function (xhr) {
            markers['bad_target'] = true;
            xhr.respond(404, {'Content-Type': 'application/json'}, '{}');
        });
    });

    afterEach(function() {
        markers = {};
        this.server.restore();
        this.clock.restore();
        document.body.innerHTML = "";
    });

    it('Click test', function() {
        defaultPopulate(this);
        triggerOnLoad(this);
        expect($('a')[0].innerHTML).to.equal('dir');
        $('a')[0].click();
        this.clock.tick(500);
        expect($('a')[0].innerHTML).to.equal('nested');
        // should trigger default error handling.
        $('a')[0].click();
        this.clock.tick(500);
    });

    it('Standard error handling', function() {
        defaultPopulate(this);
        triggerOnLoad(this);
        expect($('a')[1].innerHTML).to.equal('bad_target');
        $('a')[1].click();
        this.clock.tick(500);
    });

    it('Custom error handling test', function() {
        defaultPopulate(this, '/dir');
        triggerOnLoad(this);
        expect($('a')[1].innerHTML).to.equal('bad_target');
        // should trigger custom error handling.
        $('a')[1].click();
        this.clock.tick(500);
        expect($('tfoot')[0].innerHTML).to.contain('Error');
    });

    it('Ensure related anchors have the events.', function() {
        defaultPopulate(this);
        var div = document.createElement('div');
        div.innerHTML = (
            '<a id="inactive" href="#" data-href="/bad_target">Inactive</a>');
        document.body.appendChild(div);

        var inactive_a = $('#inactive')[0];

        // Now trigger the onload.
        triggerOnLoad(this);

        inactive_a.click();
        this.clock.tick(500);
        expect(markers.bad_target).to.be.undefined;
    });

});


describe('nunja.stock.molds/navtree inner model tests', function() {

    beforeEach(function() {
        this.clock = sinon.useFakeTimers();
    });

    afterEach(function() {
        this.clock.restore();
    });

    it('async populate', function(done) {
        var module = require('nunja.stock.molds/navtree/index');
        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/navtree');

        var model = new module.Model(div);
        model._template_name = 'dummyvalue';
        model.populate(data['/'], function() {
            expect($('a', div)[0].innerHTML).to.equal('dir');
            done();
        });
        this.clock.tick(500);
    });

});
