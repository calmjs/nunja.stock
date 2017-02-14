'use strict';

define(['nunja/core'], function(core) {

    // var core = require('nunja/core');

    var generate_test = function(name, mold_id, data_module) {
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
            expect(rendered).to.equal(answer.join('\n'));
        };

        describe(name, function() {
            for (var t_name in data) {
                it(t_name, function() {
                    test.apply(this, data[t_name]);
                });

            }
        });
    };

    return {'generate_test': generate_test};
});
