define([
    'nunja/core',
    'nunja/utils'
], function(core, utils) {
    'use strict';

    var $ = utils.$;
    var addEventListeners = utils.addEventListeners;

    var Model = function(root) {
        var self = this;

        this.root = root;
        this._template_name = 'nunja.stock.molds/navtree/table.nja';
        this.has_push_state = (
            window.history && window.history.pushState) instanceof Function;

        /*
        XXX
        A bit of a chicken and egg problem - the updates provided over
        JSON will always be available as that is the prerequisite for
        doing the rendering, but the initial view will not have any
        cached.  The *only* guaranteed hint is through the data_href
        for the element, but as that is NOT sent with the HTML the
        remaining way is to have this be available in the config.

        Reason this is needed simply because if the user navigates down,
        then back up, the state MUST be restored to the original form
        somehow as this was rendered, but given that this data will
        need to be retrieved it needs to be marked down.  Now the
        question is, if client-side rendering is not possible due to the
        data_href being unknown, is triggering a full reload acceptable?

        Alternatively, enforcing the requirement that the data-href for
        the root element could introduce other problems if the source
        data is somewhat asymmetrical in what they provide.
        */

        // XXX just assume this is available for now, deal with the
        // other not really but kind of supported cases later.
        this.config = {};
        var div = this.root.querySelector('div');
        if (div === null) {
            // XXX this should be an error
            // using surrogate values for now...
            this._id = Math.random();
            this.data_href = window.location.toString();
        }
        else {
            this._id = div.getAttribute('id');
            try {
                this.config = JSON.parse(div.getAttribute('data-config'));
            } catch(e) {
                // pass
            }
            this.data_href = this.config['data_href'];
        }

        if (this.has_push_state) {
            window.addEventListener('popstate', function(ev) {
                if ((ev.state instanceof Object) && (self._id in ev.state)) {
                    var data_uri = ev.state[self._id].data_href;
                    // XXX if the data represented is already the same,
                    // save this step?
                    self._fetch_populate(data_uri);
                }
            });
        }
    };

    Model.prototype.get = function(uri, cb, error_module) {
        var xhr = new XMLHttpRequest();
        var self = this;
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    cb(xhr);
                }
                else {
                    if (error_module) {
                        require([error_module], function(handler) {
                            handler(self, xhr);
                        });
                    }
                    else {
                        console.error(uri + ' -> error ' + xhr.status);
                    }
                }
            }
        };
        xhr.open('GET', uri, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
    };

    Model.prototype._fetch_populate = function(data_uri, cb) {
        // the callback is really an extra callback
        var self = this;
        var config = {};
        try {
            config = JSON.parse(self.root.querySelector('div').getAttribute(
                'data-config'));
        } catch (e) {
            // pass
        }
        this.get(data_uri, function(xhr) {
            if (cb instanceof Function) {
                cb(self, data_uri);
            }
            var obj = JSON.parse(xhr.responseText);
            self.populate(obj);
        }, config.error_handler);
    };

    Model.prototype.json_nav = function(ev) {
        var self = this;
        // XXX could be a common function provided by nunja or similar
        // library for initializing the initial state
        if (self.has_push_state) {
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

        // XXX this block too should be a separate common function
        if (!(self._id in window.history.state)) {
            // assign this object as a subkey
            // XXX similar to the pushState call...
            window.history.state[self._id] = {
                'data_href': this.data_href,
                // XXX seems a bit redundant?
                'model': self._id,
            };
            // need to call this to get it into the stack
            window.history.replaceState(window.history.state, document.title);
        }

        var href = ev.target.attributes.getNamedItem('href').value;
        var data_uri = ev.target.attributes.getNamedItem('data-href').value;

        var _do_push = function(self, data_uri) {
            // XXX like previous, figure out how to factor the pushState
            // things into a standalone cohesive unit
            if (self.has_push_state) {
                // take the current state, then push it in
                window.history.state[self._id] = {
                    'data_href': data_uri,
                    'model': self._id,
                };
                window.history.pushState(window.history.state, null, href);
            }
        };

        self._fetch_populate(data_uri, _do_push);
        ev.preventDefault();
        return false;
    };

    Model.prototype.populate = function(obj, _cb) {
        // Always attempt the synchronous flow whenever possible to
        // prevent various issues, but also permit asychronous flow with
        // an optional callback in the case that the codepath was forced
        // or triggered.
        var self = this;
        if (core.engine.query_template(self._template_name)) {
            core.engine.populate(self.root, obj);
            self.init();
        }
        else {
            core.engine.populate(self.root, obj, function() {
                self.init();
                if (_cb instanceof Function) {
                    _cb();
                }
            });
        }
    };

    Model.prototype.hook = function() {
        var self = this;
        // XXX all states for this MUST be set.
        addEventListeners($('[data-href]', this.root), 'click', function(ev) {
            self.json_nav(ev);
        });
    };

    Model.prototype.init = function() {
        this.hook();
    };

    var init = function(self) {
        var model = new Model(self);
        model.init();
    };

    return {
        'Model': Model,
        'init': init
    };
});
