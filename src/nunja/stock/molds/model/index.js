define([
    'nunja/core',
    'nunja/utils',
    'nunja/stock/history',
], function(core, utils, history) {
    'use strict';

    var $ = utils.$;
    var addEventListeners = utils.addEventListeners;

    var loads = function(s) {
        try {
            return JSON.parse(s);
        } catch(e) {
            return {};
        }
    };

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

        var child = this.root.querySelector(this.selector);
        if (child === null) {
            throw Error(
                "failed to select child element using '" +
                this.selector + "'");
        }

        this._id = child.getAttribute('id');
        if (!(this._id)) {
            throw Error("child element must have an id attribute");
        }

        this.config = loads(child.getAttribute('data-config'));
        this.data_href = this.config['data_href'] || null;

        if (history.has_push_state) {
            window.addEventListener('popstate', function(ev) {
                self.popstate(ev);
            }, false);
        }
    };

    Model.prototype.fetch = function(uri, cb, error_module) {
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

    // model.update should reference this instead?
    Model.prototype._fetch_populate = function(data_uri, cb) {
        /*
        Standard fetch and populate for a given model
        */
        var config = loads(this.root.querySelector('div').getAttribute(
            'data-config'));
        var self = this;
        this.fetch(data_uri, function(xhr) {
            // the callback is really an extra callback
            if (cb instanceof Function) {
                cb(self, data_uri);
            }
            var obj = JSON.parse(xhr.responseText);
            self.populate(obj);
            self.data_href = data_uri;
        }, config.error_handler);
    };

    Model.prototype.popstate = function(ev) {
        if ((ev.state instanceof Object) && (this._id in ev.state)) {
            var data_uri = ev.state[this._id].data_href;
            if (this.data_href != data_uri) {
                // only fetch and populate if the data is different.
                this._fetch_populate(data_uri);
            }
        }
    };

    Model.prototype.json_nav = function(ev) {
        // XXX ideally, the history management bits be a bit more
        // decoupled from the navigation bits.
        history.initialize();
        history.replace(this._id, this.data_href);

        var href = ev.target.attributes.getNamedItem('href').value;
        var data_uri = ev.target.attributes.getNamedItem('data-href').value;

        var _do_push = function(self, data_uri) {
            history.push(self._id, data_uri, href);
        };

        this._fetch_populate(data_uri, _do_push);
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
