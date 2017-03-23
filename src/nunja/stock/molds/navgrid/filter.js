define(['nunja.stock.molds/model/index'], function(model) {
    'use strict';

    var filtered_populate = function(filter) {
        return function(obj, cb) {
            // this deep-clones the object so that the actual filter
            // function can safely modify the object.
            return this(filter(JSON.parse(JSON.stringify(obj))), cb);
        };
    };

    // the standard template.
    var build_filtered_populate = function(filter) {
        return function() {
            return filtered_populate(filter.apply(null, arguments));
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
            var new_obj = only_filter(rule)(obj);
            new_obj.nunja_model_id = new_id;
            return new_obj;
        };
    };

    var identity = function() {
        return function(obj, cb) {
            return this(obj, cb);
        };
    };

    var only = build_filtered_populate(only_filter);
    var redirect = build_filtered_populate(redirect_filter);

    var fetch_for = function(target_model_id, uri_key, filter_rule) {
        return function(obj/*, cb */) {
            if (!(uri_key in obj.mainEntity)) {
                return false;
            }

            try {
                var target_model = model.get_model(target_model_id);
            }
            catch (e) {
                return false;
            }

            var repopulate = function(obj) {
                if (filter_rule) {
                    target_model.populate(only_filter(filter_rule)(obj));
                }
                else {
                    target_model.populate(obj);
                }
            };
            model.fetch(
                obj.mainEntity[uri_key], null, target_model, repopulate);
            // the populate (bound to `this`) is never called.
        };
    };

    return {
        'identity': identity,
        'only': only,
        'redirect': redirect,
        'fetch_for': fetch_for,
    };
});
