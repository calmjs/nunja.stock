'use strict';

var core = require('nunja/core');
var utils = require('nunja/utils');
var $ = utils.$;

var markers = {};
var model_navgrid_data = require('nunja/stock/tests/model_navgrid_data');

window.mocha.setup('bdd');

describe('nunja.stock.molds/model test cases', function() {

    var data = model_navgrid_data;

    var defaultPopulate = function(test, arg) {
        var obj = arg instanceof Object ? arg : data[arg || '/'];
        // populate the body
        var div = document.createElement('div');
        div.innerHTML = '<div data-nunja="nunja.stock.molds/model"></div>';
        test.engine.populate($('div', div)[0], obj);
        document.body.appendChild(div);
        test.clock.tick(500);
    };

    var triggerOnLoad = function(test) {
        // apply the onload trigger on the document body.
        test.engine.do_onload(document.body);
        test.clock.tick(500);
    };

    var activate_custom = function(test) {
        // some unrelated data.
        var custom_data = {
            "@context": "http://schema.org",
            "nunja_model_id": "model_grid",
            "nunja_model_config": {
                "data_href": "custom/",
                "mold_id": "nunja.stock.molds/navgrid",
                "error_handler": "nunja.stock.custom/error_handler"
            },
            "mainEntity": {
                "@id": "custom",
                "href": "custom/",
                "data_href": "custom/",
                "name": "custom",
                "size": 0,
                "additionalType": "folder",
                "@type": "ItemList",
                "itemListElement": [
                    {
                        "@id": "bad_target",
                        "href": "/bad_target",
                        "data_href": "/bad_target",
                        "name": "bad_target",
                        "size": 0,
                        "additionalType": "file",
                        "@type": "CreativeWork"
                    }
                ],
                "key_label_map": {
                    "name": "name",
                    "size": "size",
                    "additionalType": "type"
                },
                "active_keys": [
                    "name",
                    "additionalType",
                    "size"
                ]
            }
        };

        // define the custom error handler.
        define('nunja.stock.custom/error_handler', [], function() {
            return function (model, xhr) {
                // XXX this is just a proof of concept.
                var footer = document.createElement('tfoot');
                footer.innerHTML = (
                    '<tr><td>Error fetching content (' + xhr.status +
                    ')</td></tr>'
                );
                model.root.querySelector('table').appendChild(footer);
            };
        });
        test.clock.tick(500);
        return custom_data;
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
        requirejs.undef('nunja.stock.custom/error_handler');
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
        expect($('a')[1].innerHTML).to.equal('nested');
        // should trigger default error handling.
        $('a')[1].click();
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
        // nothing should change?
        expect($('a')[1].innerHTML).to.equal('bad_target');
    });

    it('Custom error handling test', function() {
        var obj = activate_custom(this);
        defaultPopulate(this, obj);
        triggerOnLoad(this);
        expect($('a')[0].innerHTML).to.equal('bad_target');
        // should trigger custom error handling.
        $('a')[0].click();
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


describe('nunja.stock.molds/model inner model tests', function() {

    var data = model_navgrid_data;

    beforeEach(function() {
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

    });

    afterEach(function() {
        this.server.restore();
        this.clock.restore();
    });

    it('inner missing div', function() {
        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        expect(function() {
            new module.Model(div);
        }).to.throw(Error, "failed to select child element using 'div'");
    });

    it('inner div missing id', function() {
        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        div.appendChild(child);
        expect(function() {
            new module.Model(div);
        }).to.throw(Error, 'child element must have an id attribute');
    });

    it('inner div bad config', function() {
        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', '}{');
        div.appendChild(child);
        var model = new module.Model(div);
        expect(model._id).to.equal('demo_object');
        expect(model.config).to.deep.equal({});
    });

    it('async populate', function(done) {
        var self = this;
        var module = require('nunja.stock.molds/model/index');
        var datum = data['/'];

        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        // emulate the standard rendering.
        var child = document.createElement('div');
        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', JSON.stringify({
            "data_href": datum.nunja_model_config.data_href}));
        div.appendChild(child);

        var model = new module.Model(div);
        model.populate(datum, function() {
            var history = require('nunja/stock/history');

            expect($('a', div)[0].innerHTML).to.equal('dir');
            expect(model.data_href).to.equal(
                datum.nunja_model_config.data_href);
            $('a', div)[0].click();
            self.clock.tick(500);

            expect($('a', div)[1].innerHTML).to.equal('nested');
            expect(model.data_href).to.equal(
                data['/dir/'].nunja_model_config.data_href);
            if (history.has_push_state) {
                expect(window.location.search).to.equal('?/dir/');
            }
            $('a', div)[1].click();
            self.clock.tick(500);

            expect($('a', div)[1].innerHTML).to.equal('deep');
            expect(model.data_href).to.equal(
                data['/dir/nested/'].nunja_model_config.data_href);
            if (history.has_push_state) {
                expect(window.location.search).to.equal('?/dir/nested/');
            }

            done();
        });
        this.clock.tick(500);
    });

});
