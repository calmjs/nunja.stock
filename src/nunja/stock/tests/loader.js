'use strict';

// var core = require('nunja/core');

var GenerateTestFactory = function(core, test_lib) {
    return function(name, mold_id, data_module) {
        /*
        name
            description of the test
        mold_id
            The mold id to render with
        data_module
            The module to load the data from
        */

        var data = require(data_module);

        var test = function(data, answer) {
            var rendered = core.engine.execute(
                mold_id, data
            ).split('\n').filter(function(v) {
                return v.trim().length > 0;
            }).join('\n');
            test_lib.expect(rendered).to.equal(answer.join('\n'));
        };

        test_lib.describe(name, function() {
            for (var t_name in data) {
                (function(args) {
                    test_lib.it(t_name, function() {
                        test.apply(test, args);
                    });
                })(data[t_name]);
            }
        });
    };
};


define(['nunja/core'], function(core) {

    // Default values taken from globals
    var lib = {
        'it': it,
        'describe': describe,
        'expect': expect,
    };

    var generate_test = GenerateTestFactory(core, lib);

    return {
        'GenerateTestFactory': GenerateTestFactory,
        'generate_test': generate_test
    };
});
