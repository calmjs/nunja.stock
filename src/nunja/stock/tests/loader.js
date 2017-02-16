'use strict';

define(['nunja/core'], function(core) {

    // var core = require('nunja/core');

    var generate_test = function(name, mold_id, data_module, lib) {
        /*
        name
            description of the test
        mold_id
            The mold id to render with
        data_module
            The module to load the data from
        */

        if (!(lib)) {
            lib = {
                it: it,
                describe: describe,
                expect: expect,
            }
        }

        var data = require(data_module);

        var test = function(data, answer) {
            var rendered = core.engine.execute(
                mold_id, data
            ).split('\n').filter(function(v) {
                return v.trim().length > 0;
            }).join('\n');
            lib.expect(rendered).to.equal(answer.join('\n'));
        };

        lib.describe(name, function() {
            for (var t_name in data) {
                (function(args) {
                    lib.it(t_name, function() {
                        test.apply(test, args);
                    });
                })(data[t_name]);
            }
        });
    };

    return {'generate_test': generate_test};
});
