'use strict';

var core = require('nunja/core');
var utils = require('nunja/utils');
var $ = utils.$;

var model_navgrid_data = require('nunja/stock/tests/model_navgrid_data');


var setup_window_event_listener = function(testcase) {
    // setup the cleanup for window event listeners
    var window_addEventListener = window.addEventListener;
    testcase.window_listeners = [];
    window.addEventListener = function(type, listener, options) {
        testcase.window_listeners.push([type, listener, options]);
        window_addEventListener(type, listener, options);
    };
    // only bind the original listener here after the method has
    // been created above.
    testcase.window_addEventListener = window_addEventListener;
};


var teardown_window_event_listener = function(testcase) {
    // cleanup window event listeners.
    testcase.window_listeners.forEach(function(v) {
        window.removeEventListener.apply(window, v);
    });
    window.addEventListener = testcase.window_addEventListener;
};


window.mocha.setup('bdd');

describe('nunja.stock.molds/model test cases', function() {

    var data = model_navgrid_data;
    var markers = {};

    var defaultPopulate = function(test, arg) {
        var obj = arg instanceof Object ? arg : data[arg || '/'];
        // populate the body
        var div = document.createElement('div');
        div.innerHTML = '<div data-nunja="nunja.stock.molds/model"></div>';
        test.engine.populate($('div', div)[0], obj);
        document.body.appendChild(div);
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
            xhr.respond(400, {'Content-Type': 'application/json'}, '{}');
        });

        this.server.respondWith('GET', '/empty', function (xhr) {
            xhr.respond(200, {
                'Content-Type': 'application/json'}, '{"empty":true}');
        });

        this.server.respondWith('GET', '/not_json', function (xhr) {
            xhr.respond(200, {
                'Content-Type': 'text/plain'}, '<html></html>');
        });

        setup_window_event_listener(this);

    });

    afterEach(function() {
        markers = {};
        requirejs.undef('nunja.stock.custom/error_handler');
        this.server.restore();
        this.clock.restore();
        // TODO ideally, all the history should be wiped.
        window.history.replaceState(null, '');
        document.body.innerHTML = "";

        teardown_window_event_listener(this);

    });

    it('Click test', function() {
        defaultPopulate(this);
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
        expect($('a')[1].innerHTML).to.equal('bad_target');
        $('a')[1].click();
        this.clock.tick(500);
        // nothing should change?
        expect($('a')[1].innerHTML).to.equal('bad_target');
    });

    it('Custom error handling test', function() {
        var obj = activate_custom(this);
        defaultPopulate(this, obj);
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

        inactive_a.click();
        this.clock.tick(500);
        expect(markers.bad_target).to.be.undefined;
    });

    it('Standard get_model call', function() {
        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        child.setAttribute('id', 'demo_object');
        div.appendChild(child);
        var model = new module.Model(div);
        expect(module.get_model('demo_object')).to.equal(model);
    });

    it('Standard fetch call with custom handler', function() {
        var module = require('nunja.stock.molds/model/index');
        var result;
        module.fetch('/empty', 'some_href', null, function(obj) {
            result = obj;
        });
        this.clock.tick(500);
        expect(result).to.deep.equal({'empty': true});
    });

    it('Standard fetch, no model', function() {
        var module = require('nunja.stock.molds/model/index');
        var result;
        module.fetch('/empty', 'some_href', null, function(obj) {
            result = obj;
        });
        this.clock.tick(500);
        expect(result).to.deep.equal({'empty': true});
    });

    it('Standard fetch, no model, request error no error handler', function() {
        var module = require('nunja.stock.molds/model/index');
        var handler = sinon.spy();
        module.fetch('/bad_target', 'some_href', null, handler);
        this.clock.tick(500);
        expect(handler.called).to.be.false;
    });

    it('Standard fetch, no model, request error, error handler', function() {
        var module = require('nunja.stock.molds/model/index');
        var handler = sinon.spy();
        var code;
        var error_handler = function(xhr) {
            code = xhr.status;
        };
        module.fetch('/bad_target', 'some_href', null, handler, error_handler);
        this.clock.tick(500);
        expect(handler.called).to.be.false;
        expect(code).to.equal(400);
    });

    it('Standard fetch, no model, not json error', function() {
        var module = require('nunja.stock.molds/model/index');
        var handler = sinon.spy();
        var code;
        var error_handler = function(xhr) {
            code = xhr.status;
        };
        module.fetch('/not_json', 'some_href', null, handler, error_handler);
        this.clock.tick(500);
        expect(handler.called).to.be.false;
        expect(code).to.equal(200);
    });

});


describe('nunja.stock.molds/model inner model tests', function() {

    var data = model_navgrid_data;
    var result_items = [];
    var _defaultOnError = requirejs.onError;

    var demo_module_name = 'nunja.molds.demo/module/index';
    var demo_module = {
        'demo': function(a, b, c) {
            result_items.push([a, b, c]);
        }
    };

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

        setup_window_event_listener(this);
    });

    afterEach(function() {
        teardown_window_event_listener(this);
        this.server.restore();
        this.clock.restore();
        requirejs.undef(demo_module_name);
        result_items = [];
        requirejs.onError = _defaultOnError;
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
        expect(model.id).to.equal('demo_object');
        expect(model.config).to.deep.equal({});
    });

    it('inner div config hook', function() {
        define(demo_module_name, [], demo_module);

        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        var config = {
            'hooks': [['nunja.molds.demo/module/index', 'demo', [1, 2, 3]]],
        };

        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', JSON.stringify(config));
        div.appendChild(child);
        var model = new module.Model(div);
        this.clock.tick(500);
        expect(model.id).to.equal('demo_object');
        expect(model.config).to.deep.equal(config);
        expect(result_items[0]).to.deep.equal([1, 2, 3]);
    });

    it('inner div config hook with errors', function(done) {
        define(demo_module_name, [], demo_module);
        this.clock.tick(500);
        var errors = 2;
        var counter = 0;

        // a potential flaw in this plan is if the errors somehow gets
        // triggered before the correct outcomes, but from testing it
        // seems to happen later in all cases.
        requirejs.onError = function() {
            counter++;
            if (counter >= errors) {
                expect(result_items[1]).to.deep.equal([1, 2, 3]);
                done();
            }
        };

        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        var config = {
            'hooks': [
                // errors with an import error
                ['nunja.molds.demo/no_module/index', 'no_such_thing', []],
                // errors with an calling undefined error
                ['nunja.molds.demo/module/index', 'no_such_thing', []],
                // should not error
                ['nunja.molds.demo/module/index', 'demo', {}],
                // the good one should still be called.
                ['nunja.molds.demo/module/index', 'demo', [1, 2, 3]],
            ]
        };

        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', JSON.stringify(config));
        div.appendChild(child);
        new module.Model(div);
        this.clock.tick(500);
    });

    it('inner div config hook wrong type', function() {
        define(demo_module_name, [], demo_module);

        var module = require('nunja.stock.molds/model/index');
        var div = document.createElement('div');
        var child = document.createElement('div');
        var config = {'hooks': 'some bad type'};
        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', JSON.stringify(config));
        div.appendChild(child);

        var model = new module.Model(div);
        this.clock.tick(500);

        expect(model.id).to.equal('demo_object');
        expect(model.config).to.deep.equal(config);
    });

    it('initial populate mismatch id not exist', function() {
        var module = require('nunja.stock.molds/model/index');
        var datum = JSON.parse(JSON.stringify(data['/']));
        datum.nunja_model_id = "id" + Math.random();

        // emulate the standard rendering.
        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        var child = document.createElement('div');
        child.setAttribute('id', 'not_model_grid');
        div.appendChild(child);

        var model = new module.Model(div);
        expect(function() {
            model.populate(datum);
        }).to.throw(
            Error, "model '" + datum.nunja_model_id + "' does not exist.");
    });

    it('initial populate mismatch id exist', function() {
        var module = require('nunja.stock.molds/model/index');
        var datum = JSON.parse(JSON.stringify(data['/']));
        datum.nunja_model_id = 'predefined';

        // emulate the standard rendering.
        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        var child = document.createElement('div');
        child.setAttribute('id', 'not_model_grid');
        div.appendChild(child);

        // the actual element
        var div2 = document.createElement('div');
        div2.setAttribute('data-nunja', 'nunja.stock.molds/model');
        var child2 = document.createElement('div');
        child2.setAttribute('id', datum.nunja_model_id);
        div2.appendChild(child2);

        var model = new module.Model(div);
        new module.Model(div2);
        model.populate(datum);

        expect($('a', div).length).to.equal(0);
        expect($('a', div2)[0].innerHTML).to.equal('dir');
    });

    it('initial populate mismatch id model forced rename', function() {
        var module = require('nunja.stock.molds/model/index');
        var datum = JSON.parse(JSON.stringify(data['/']));
        datum.nunja_model_id = 'to_be_renamed';

        // emulate the standard rendering.
        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        var child = document.createElement('div');
        child.setAttribute('id', datum.nunja_model_id);
        div.appendChild(child);
        var model = new module.Model(div);
        // force an id mismatch here, i.e. the id here no longer match
        // with the one tracked by the manager.
        model.id = 'renamed';

        expect(function() {
            // As the id stored and referenced by the map is mismatched,
            // the populate method will fetch and return the same object
            // resulting in an infinite loop, so raise this exception.
            model.populate(datum);
        }).to.throw(
            Error, "model 'to_be_renamed' has mismatched id ('renamed')");
    });

    it('json_nav disabled without model.data_href defined', function() {
        var module = require('nunja.stock.molds/model/index');
        var datum = data['/'];

        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        var child = document.createElement('div');
        child.setAttribute('id', 'model_grid');
        div.appendChild(child);

        var model = new module.Model(div);
        // Since the element did not provided one via data-config
        expect(model.data_href).to.be.null;
        // As this is populated using the default method, the data_href
        // will be assigned, so we need; server side rendering will have
        // this fully pre-rendered and this rendering will not be done
        // like so, which sets data_href...
        model.populate(datum);
        // To properly test this, that need to be flipped back to its
        // default state where the config doe snot define this.
        model.data_href = null;

        var target = $('a', div)[0];
        expect(target.innerHTML).to.equal('dir');
        // not providing a preventDefault as that is not called; if that
        // condition it will try to call preventDefault and then fail.
        expect(model.json_nav({'target': target})).to.be.false;
        // Naturally, calling this will trigger a standard click as the
        // trap is disabled.  Since the test framework can't handle this
        // it is to remain commented.
        // target.click();
    });

    it('initial populate and click interaction in callback', function(done) {
        var self = this;
        var module = require('nunja.stock.molds/model/index');
        var datum = data['/'];

        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        // emulate the standard rendering.
        var child = document.createElement('div');
        child.setAttribute('id', 'model_grid');
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

    it('populate with hook', function(done) {
        var datum = {
            "nunja_model_id": "demo_object2",
            "nunja_model_config": {
                "data_href": "/dummy.py?/hello",
                "mold_id": "nunja.stock.mock/async"
            },
            'value': 'hello world.'
        };

        // define the custom module
        define('nunja.stock.mock/async/mod', [], function() {
            return {
                'alt_populate': function() {
                    return (function(obj, cb) {
                        obj.value = 'alt: ' + obj.value;
                        this(obj, cb);
                    });
                }
            };
        });

        var module = require('nunja.stock.molds/model/index');

        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        // emulate the standard rendering.
        var child = document.createElement('div');
        child.setAttribute('id', 'demo_object2');
        child.setAttribute('data-config', JSON.stringify({
            "data_href": datum.nunja_model_config.data_href,
            "hooks": [
                ['nunja.stock.molds/model/hook', 'custom_populate', [[
                    ['nunja.stock.mock/async/mod', 'alt_populate', []],
                ]]],
            ],
        }));
        div.appendChild(child);

        var model = new module.Model(div);
        // trigger the async things for the model, i.e. the assignment
        // of the populate_handlers.
        this.clock.tick(500);

        // Override the real populate with this dummy; though this can
        // probably be done with a dummy module, this is fine for now.
        model.populate = function(obj, cb) {
            $('div', model.root)[0].innerHTML = obj.value;
            cb();
        };

        model.trigger_populate(datum, function() {
            // the one single event pushed.
            expect(model.populate_handlers.length).to.equal(1);
            expect($('div', model.root)[0].innerHTML).to.equal(
                'alt: hello world.');
            done();
        });
    });

});


describe('nunja.stock.molds/model inner model async macro', function() {

    before(function() {
        this.engine = core.engine;
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;

        // simply just declare a single main macro for the dummy
        var macro = [
            '{%- macro main(mainEntity, meta={}) %}',
            '<p>{{ mainEntity.value }}</p>',
            '<a href="/foo" data_href="/foo">Dummy Link</a>',
            '{%- endmacro %}'
        ].join('\n');
        // the template can be omitted because the model template is
        // used instead.

        this.server.respondWith(
            'GET', '/base/nunja.stock.mock/async/macro.nja',
            function (xhr) {
                xhr.respond(200, {'Content-Type': 'text/plain'}, macro);
            }
        );

        requirejs.config({
            'baseUrl': '/base',
            'paths': {
                'nunja.stock.mock/async': 'nunja.stock.mock/async',
            }
        });

    });

    after(function() {
        this.server.restore();
        requirejs.undef('nunja.stock.mock/async/mod');
    });

    beforeEach(function() {
        setup_window_event_listener(this);
    });

    afterEach(function() {
        teardown_window_event_listener(this);
        document.body.innerHTML = "";
        // TODO ideally, all the history should be wiped.
        window.history.replaceState(null, '');
    });

    it('async populate fresh', function(done) {
        var datum = {
            "@context": "http://schema.org",
            "nunja_model_id": "demo_object",
            "nunja_model_config": {
                "data_href": "/dummy.py?/hello",
                "mold_id": "nunja.stock.mock/async"
            },
            "mainEntity": {
                "@id": "/",
                "href": "/dummy.py?/hello",
                "data_href": "/dummy.py?/hello",
                "@type": "CreativeWork",
                "value": "hello world.",
            }
        };

        // requires actual asynchronous load path
        var self = this;
        var module = require('nunja.stock.molds/model/index');

        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        // emulate the standard rendering.
        var child = document.createElement('div');
        child.setAttribute('id', 'demo_object');
        child.setAttribute('data-config', JSON.stringify({
            "data_href": datum.nunja_model_config.data_href}));
        div.appendChild(child);

        var model = new module.Model(div);

        model.trigger_populate(datum, function() {
            // the one single event pushed.
            expect($('p', div)[0].innerHTML).to.equal('hello world.');
            expect(self.window_listeners.length).to.equal(1);
            done();
        });
    });

});
