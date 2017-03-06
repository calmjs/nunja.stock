'use strict';


var has_push_state = (
    (typeof window !== 'undefined') &&
    (window.history && window.history.pushState) instanceof Function
);


var initialize = function() {
    if (has_push_state) {
        // dump in a new state to manipulate with if one has not
        // already been created
        if (window.history.state === null) {
            window.history.replaceState({}, document.title);
        }
        // sanity check - a standard object can be worked with.
        else if (!(window.history.state instanceof Object)) {
            console.warn(
                'window.history.state was not an object; fixing...');
            window.history.replaceState({}, document.title);
        }
    }
};


var modify_state = function(method, obj, title, url) {
    var k;
    var state = {};
    for (k in window.history.state) {
        state[k] = window.history.state[k];
    }
    for (k in obj) {
        state[k] = obj[k];
    }
    window.history[method](state, title, url || null);
    return true;
};


exports.has_push_state = has_push_state;
exports.initialize = initialize;
exports.modify_state = modify_state;
