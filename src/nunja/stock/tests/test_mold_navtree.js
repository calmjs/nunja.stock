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

        var self = this;

        for (var key in data) {
            // form a proper closure via parameters to an anonymous
            // function so that the inner function can use the right
            // values.
            (function(target, datum) {
                self.server.respondWith('GET', target, function (xhr) {
                    var s = JSON.stringify(datum);
                    xhr.respond(200, {'Content-Type': 'application/json'}, s);
                });
            }('/script.py?' + key, data[key]));
        }

        this.server.respondWith('GET', '/bad_target', function (xhr) {
            markers['bad_target'] = true;
            xhr.respond(404, {'Content-Type': 'application/json'}, '{}');
        });

        // setup the cleanup for window event listeners
        var window_addEventListener = window.addEventListener;
        this.window_listeners = [];
        window.addEventListener = function(type, listener, options) {
            self.window_listeners.push([type, listener, options]);
            window_addEventListener(type, listener, options);
        };
        // only bind the original listener here after the method has
        // been created above.
        this.window_addEventListener = window_addEventListener;
    });

    afterEach(function() {
        markers = {};
        this.server.restore();
        this.clock.restore();
        // TODO ideally, all the history should be wiped.
        window.history.replaceState(null, '');
        document.body.innerHTML = "";

        // cleanup window event listeners.
        this.window_listeners.forEach(function(v) {
            window.removeEventListener.apply(window, v);
        });
        window.addEventListener = this.window_addEventListener;
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

    it('Pop state', function(done) {
        // also apply a purposely bad state
        window.history.replaceState('', '');
        defaultPopulate(this);
        triggerOnLoad(this);
        $('a')[0].click();
        this.clock.tick(500);

        // this is a bit tricky: since the WebKit family of browsers
        // (i.e. PhantomJS, Chromium, Safari) take their sweet, sweet
        // time to actually register the event listener, and that they
        // will _eventually_ fire in the order they were registered in,
        // take advantage of that fact and register one of our own here
        // to finish off the test.
        var self = this;
        window.addEventListener('popstate', function() {
            // tick to ensure fake server responds to trigger render.
            self.clock.tick(500);
            expect($('a')[0].innerHTML).to.equal('dir');
            done();
        }, false);

        // naturally, trigger the back action first.
        window.history.back();
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
