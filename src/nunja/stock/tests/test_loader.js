'use strict';

var core = require('nunja/core');
var loader = require('nunja/stock/tests/loader');

var fake_data = {
    "test pass": [{"value": "hello"}, [
        '<div data-nunja="dummy/mold">',
        'hello',
        '</div>'
    ]],
    "test fail": [{"value": "hello"}, [
        '<div data-nunja="dummy/mold">',
        "goodbye",
        '</div>'
    ]]
};


describe('test loader tests', function() {

    beforeEach(function() {
        this.clock = sinon.useFakeTimers();

        this.nunjucksPrecompiled = window.nunjucksPrecompiled;
        window.nunjucksPrecompiled = {};

        define('__nunja__/dummy/mold', [], function() {
            var nunjucksPrecompiled = window.nunjucksPrecompiled;
            nunjucksPrecompiled["dummy/mold/template.nja"] = (
                function() { function root(env, context, frame, runtime, cb) {
                    var output = runtime.suppressValue(
                        runtime.contextOrFrameLookup(context, frame, "value"),
                        env.opts.autoescape
                    );
                    cb(null, output);
                } return {root: root};}
            )();
            window.nunjucksPrecompiled = nunjucksPrecompiled;
            return nunjucksPrecompiled;
        });

        define('data', [], function() {
            return fake_data;
        });

        // inject the dummy modules
        require(['__nunja__/dummy/mold', 'data'], function() {});
        // also ensure the template is loaded.
        core.engine.load_template('dummy/mold/template.nja', function() {});
        this.clock.tick(500);
        // restore immediately.
        this.clock.restore();
    });

    afterEach(function() {
        window.nunjucksPrecompiled = this.nunjucksPrecompiled;
        requirejs.undef('__nunja__/dummy/mold');
        requirejs.undef('data');
    });

    it('test_run', function(done) {
        // As there is literally no way to test the test framework from
        // within itself due to copious amounts of callbacks and nested
        // callbacks (thus the inability to trap thing), just stub all
        // the things and make sure the values to be tested are actually
        // what we expect.
        var self = this;
        var results = [];
        var tests = [];

        var check = function() {
            // since there is a bunch of async stuff, do the final
            // checks here when we have collated all the data.
            expect(results).to.deep.equal([
                [
                    '<div data-nunja="dummy/mold">\nhello\n</div>',
                    '<div data-nunja="dummy/mold">\nhello\n</div>'
                ],
                [
                    '<div data-nunja="dummy/mold">\nhello\n</div>',
                    '<div data-nunja="dummy/mold">\ngoodbye\n</div>'
                ]
            ]);
            done();
        };

        var fake_expect = function(first) {
            var result = [first];
            return {
                'to': {
                    'equal': function(second) {
                        result.push(second);
                        results.push(result);
                        if (results.length == Object.keys(fake_data).length) {
                            check();
                        }
                    },
                    'be': {'null': true},
                }
            };
        };

        var fake_describe = function(desc, f) {
            f();
            tests.forEach(function(test) {
                test(function() {});
                self.clock.tick(500);
            });
        };

        var fake_it = function(desc, f) {
            // emulate the collection of all the tests
            tests.push(f);
        };

        var lib = {
            expect: fake_expect,
            describe: fake_describe,
            it: fake_it,
        };

        var generate_test = loader.GenerateTestFactory(core, lib);

        generate_test(
            'Test runner example',
            'dummy/mold',
            'data'
        );

    });

});
