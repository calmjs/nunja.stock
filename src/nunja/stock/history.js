'use strict';


exports.has_push_state = (
    (typeof window !== 'undefined') &&
    (window.history && window.history.pushState) instanceof Function
);


var initialize = function() {
    if (!(exports.has_push_state)) {
        return false;
    }

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
    return true;
};


var modify_state = function(method, obj, title, url) {
    if (!(exports.has_push_state)) {
        return false;
    }

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


var make_node_state = function(id, data_href) {
    var state = {};
    state[id] = {
        'data_href': data_href,
    };
    return state;
};


var replace = function(id, data_href) {
    /*
    Update the current state for the given id with the given data_href
    */

    if ((window.history.state instanceof Object) &&
            (id in window.history.state) &&
            (window.history.state[id].data_href == data_href)) {
        return false;
    }
    return modify_state(
        'replaceState', make_node_state(id, data_href), document.title);
};


var push = function(id, data_href, href) {
    /*
    Push a new state for the given id with the given data_href.
    */

    return modify_state(
        'pushState', make_node_state(id, data_href), document.title, href);
};


exports.initialize = initialize;
exports.modify_state = modify_state;
exports.replace = replace;
exports.push = push;
