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

    var models = {};

    var get_model = function(id) {
        // verify that the model exist and that the id is the same
        var result = models[id];
        if (!result) {
            throw Error("model '" + id + "' does not exist.");
        }
        else if (result.id != id) {
            // as this will break rendering, and since the model _can_
            // be controlled/accessed to have its id be manipulated, we
            // need this check.
            throw Error(
                "model '" + id + "' has mismatched id ('" + result.id + "')");
        }
        return result;
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

        // XXX currently, the constructor is coupled to a DOM element.
        // this may be undesirable in the future.
        var child = this.root.querySelector(this.selector);
        if (child === null) {
            throw Error(
                "failed to select child element using '" +
                this.selector + "'");
        }

        this.id = child.getAttribute('id');
        if (!(this.id)) {
            throw Error("child element must have an id attribute");
        }
        // TODO ensure that at time of construction, verify that no
        // other elements share this id.

        // store a reference in the global mapping;
        // XXX how to deal with reuse/collisions?
        // XXX for testing, this is going to get big huge...
        models[this.id] = this;

        this.config = loads(child.getAttribute('data-config'));
        this.data_href = this.config && this.config.data_href || null;

        (this.config && this.config.hooks instanceof Array ?
            this.config.hooks : []
        ).forEach(function(entry) {
            (function(module_name, callable, args) {
                require([module_name], function(module) {
                    // the called function will have a reference to
                    // this object.
                    module[callable].apply(self, args);
                });
            }).apply(null, entry);
        });

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
    Model.prototype._fetch_populate = function(data_uri, href) {
        /*
        Standard fetch and populate for a given model
        */
        // XXX should this target (i.e. _fetch_populate) actually be
        // configurablefrom the model? i.e. be able to be swapped out
        // with another function/method?
        var config = loads(this.root.querySelector('div').getAttribute(
            'data-config'));
        var self = this;
        this.fetch(data_uri, function(xhr) {
            // the callback is really an extra callback
            var obj = JSON.parse(xhr.responseText);
            // XXX what if we follow https://schema.org/WebPageElement
            // also xml:id, and have a case where populate against that,
            // i.e. activate a link on breadcrumbs populates some other
            // element, what happens then?
            self.populate(obj);
            if (href) {
                // TODO see if this other check can also be used: if the
                // fetched data uri is the same as state, the push can
                // be avoided, which also avoids the extra push where
                // the uri stays the same; however, this data_uri
                // difference may not apply to the underlying href, and
                // vice-versa, so this can be problematic at the end.
                // Regardless, this is fine for now.
                history.push(self.id, data_uri, href);
                // Note that while the populate method may delegate the
                // rendering to another model, the fact that this model
                // initially responded must be tracked, so this is the
                // id that will be pushed.
            }
        }, config.error_handler);
    };

    Model.prototype.popstate = function(ev) {
        if ((ev.state instanceof Object) && (this.id in ev.state)) {
            var data_uri = ev.state[this.id].data_href;
            if (this.data_href != data_uri) {
                // only fetch and populate if the data is different.
                this._fetch_populate(data_uri);
            }
        }
    };

    Model.prototype.json_nav = function(ev) {
        // XXX ideally, the history management bits be a bit more
        // decoupled from the navigation bits.
        if (!this.data_href) {
            return false;
        }

        history.initialize();
        // this may seem redundant, but this is more for the initial
        // state as the model does not set the state until required,
        // i.e. when this feature is needed right here.
        history.replace(this.id, this.data_href);

        // Always need the href because this is _the_ canonical URI for
        // the target resource.
        var href = ev.target.attributes.getNamedItem('href').value;
        // The data-href is what will provide the data for the template;
        // done so as an explicit marker, and also that browsers are bad
        // at dealing with caching of multiple hypermedia types provided
        // by the same URI.
        var data_uri = ev.target.attributes.getNamedItem('data-href').value;

        this._fetch_populate(data_uri, href);
        ev.preventDefault();
    };

    Model.prototype.populate = function(obj, cb) {
        var self = this;

        var after_populate = function() {
            self.data_href = obj.nunja_model_config.data_href;
            self.init();
            if (cb instanceof Function) {
                cb();
            }
        };

        if (obj.nunja_model_id != this.id) {
            // if this model does not exist, or its id does not match,
            // what then?
            return get_model(obj.nunja_model_id).populate(obj, cb);
        }

        // Always attempt the synchronous flow whenever possible to
        // prevent various issues, but also permit asychronous flow with
        // an optional callback in the case that the codepath was forced
        // or triggered.
        var template_name = obj.nunja_model_config.mold_id + '/macro.nja';
        if (core.engine.query_template(template_name)) {
            core.engine.populate(self.root, obj);
            after_populate();
        }
        else {
            core.engine.populate(self.root, obj, after_populate);
        }
    };

    Model.prototype.enable_data_href = function() {
        var self = this;
        // XXX TODO [data-href], 'click', the function json_nav are all
        // magic thus should be figured out how to make this be part of
        // the object configuration.
        // Though these should remain defaults.
        addEventListeners($('[data-href]', this.root), 'click', function(ev) {
            self.json_nav(ev);
        });
    };

    Model.prototype.init = function() {
        this.enable_data_href();
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
