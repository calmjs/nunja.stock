define([], function() {
    'use strict';

    var filtered_populate = function(filter) {
        return function(obj, cb) {
            return this(filter(JSON.parse(JSON.stringify(obj))), cb);
        };
    };

    var only_filter = function(rule) {
        return function(obj) {
            var items = obj.mainEntity.itemListElement.filter(function(item) {
                for (var key in rule) {
                    if (rule[key] != item[key]) {
                        return false;
                    }
                }
                return true;
            });
            obj.mainEntity.itemListElement = items;
            return obj;
        };
    };

    var redirect_filter = function(new_id, rule) {
        return function(obj) {
            var new_obj  = only_filter(rule)(obj);
            new_obj.nunja_model_id = new_id;
            return new_obj;
        };
    };

    var create_filter = function(filter) {
        return function() {
            return filtered_populate(filter.apply(null, arguments));
        };
    };

    var only = create_filter(only_filter);
    var redirect = create_filter(redirect_filter);

    return {
        'only': only,
        'redirect': redirect,
    };
});
