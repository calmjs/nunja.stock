define([
    'nunja/core',
    'nunja/utils',
    'nunja/stock/history',
], function(core, utils, history) {
    'use strict';

    var $ = utils.$;
    var addEventListeners = utils.addEventListeners;

    var Model = function(root, selector) {
        /*
        Create a view model that is associated the root element with a
        selector for the immediate node that will be updated via JSON.
        */

        var self = this;
        this.selector = selector || 'div';

        this.root = root;

        /*
        data-href is _required_ for this element simply because that is
        the data that will be fetched for the restoration of this state
        when user traverses back into here through the back button.  It
        is to be provided through the config since href is associated
        with the anchor node.
        */

        this.config = {};
        var child = this.root.querySelector(this.selector);
        if (child === null) {
            // XXX this should be an error
            // using surrogate values for now...
            this._id = Math.random();
            this.data_href = window.location.toString();
        }
        else {
            // XXX none of this is guaranteed to work
            // TODO write test cases for various cases of missing data
            // TODO define behavior for missing data.
            this._id = child.getAttribute('id');
            try {
                this.config = JSON.parse(child.getAttribute('data-config'));
            } catch(e) {
                // pass
            }
            this.data_href = this.config['data_href'];
        }

        if (history.has_push_state) {
            window.addEventListener('popstate', function(ev) {
                if ((ev.state instanceof Object) && (self._id in ev.state)) {
                    var data_uri = ev.state[self._id].data_href;
                    // XXX if the data represented is already the same,
                    // save this step?
                    self._fetch_populate(data_uri);
                }
            }, false);
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
        history.initialize();

        // XXX this block too should be a separate common function
        if (!(self._id in window.history.state)) {
            // assign this object as a subkey
            // XXX similar to the pushState call...
            var state = {};
            state[self._id] = {
                'data_href': this.data_href,
                // XXX seems a bit redundant?
                'model': self._id,
            };
            history.modify_state('replaceState', state, document.title);
        }

        var href = ev.target.attributes.getNamedItem('href').value;
        var data_uri = ev.target.attributes.getNamedItem('data-href').value;

        var _do_push = function(self, data_uri) {
            // XXX like previous, figure out how to factor the pushState
            // things into a standalone cohesive unit
            if (history.has_push_state) {
                // take the current state, then push it in
                var state = {};
                state[self._id] = {
                    'data_href': data_uri,
                    // XXX seems a bit redundant?
                    'model': self._id,
                };
                history.modify_state('pushState', state, document.title, href);
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
        var template_name = obj.nunja_model_config.mold_id + '/macro.nja';
        if (core.engine.query_template(template_name) && (_cb == null)) {
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
