'use strict';

window.mocha.setup('bdd');

var describe_ = (typeof requirejs == 'undefined') ? describe.skip : describe;

describe_('nunja.stock.molds/model/hook', function() {

    var hook = require('nunja.stock.molds/model/hook');

    var modules = {
        'dummy.mod1': {
            'callable_a': function() {
                return [].slice.call(arguments);
            },
            'callable_b': function() {
                return 'called b';
            }
        },
        'dummy.mod2': {
            'callable_c': function() {
                return 'called c';
            },
        },
        'dummy.mod3': {
            'modify': function(value) {
                this.modified = value;
            },
        },
    };

    before(function() {
        this.clock = sinon.useFakeTimers();
        for (var name in modules) {
            (function(module) {
                define(name, [], module);
            })(modules[name]);
        }
        this.clock.tick(500);
    });

    after(function() {
        for (var name in modules) {
            requirejs.undef(name);
        }
        this.clock.restore();
    });

    it('amd_call_map simple apply test', function() {
        var results = [];
        hook.amd_call_map(null, [
            ['dummy.mod1', 'callable_a', ['some', 'arguments']],
            ['dummy.mod2', 'callable_c', []],
        ], results);
        this.clock.tick(500);
        expect(results).to.deep.equal([['some', 'arguments'], 'called c']);
    });

    it('amd_call_map object modify test', function() {
        var results = [];
        var obj = {};
        hook.amd_call_map(obj, [
            ['dummy.mod3', 'modify', ['some value']],
        ], results);
        this.clock.tick(500);
        expect(obj.modified).to.equal('some value');
        expect(results.length).to.equal(1);
    });

    it('custom_populate test case', function() {
        // simply a specialized case of the previous
        var obj = {};
        hook.custom_populate.apply(obj, [[
            ['dummy.mod1', 'callable_a', ['some', 'arguments']],
            ['dummy.mod1', 'callable_b', []],
            ['dummy.mod2', 'callable_c', []],
        ]]);
        this.clock.tick(500);
        expect(obj.populate_handlers).to.deep.equal(
            [['some', 'arguments'], 'called b', 'called c']);
    });

});
