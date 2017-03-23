define([
    'nunja/core',
    'nunja/utils',
    'nunja/stock/history',
    'nunja.stock.molds/model/hook',
], function(core, utils, history, hook) {
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

    // for the push state manager; originally I thought having each
    // object deal with their data, but given that there is now only
    // one method for fetching data and is co-ordinated at the level of
    // this module, just use this standard id for now.

    // Will have to explore how simultaneous shared control of history
    // states across multiple components that rely on different data
    // sources might work later.
    var default_state_id = 'nunja.stock.mold/model/__state_id__';

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

    var fetch = function(data_uri, href, caller, handler, error_handler) {
        var process_error = function(xhr) {
            // grab error definition
            if (error_handler instanceof Function) {
                return error_handler(xhr);
            }
            var error_def = (
                caller && caller.config && caller.config.error_handler);
            if (error_def) {
                require([error_def], function(error_handler) {
                    // XXX shouldn't an attribute from that
                    // module be invoked instead?
                    error_handler(caller, xhr);
                });
            }
            else {
                console.error(data_uri + ' -> error; status: ' + xhr.status);
            }
        };

        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    // not using loads because error handling.
                    // XXX have this be in try/catch too
                    try {
                        var obj = JSON.parse(xhr.responseText);
                    }
                    catch(e) {
                        return process_error(xhr);
                    }
                    if (handler instanceof Function) {
                        return handler(obj);
                    }
                    var populated = get_model(
                        obj.nunja_model_id).trigger_populate(obj);
                    if (populated && href) {
                        // TODO standard browser behavior on history
                        // state is that if the href remains the same,
                        // no history is pushed; see if this can be
                        // implemented.
                        // Simply push with server specified model id.
                        history.push(caller.state_id, data_uri, href);
                    }
                }
                else {
                    process_error(xhr);
                }
            }
        };
        xhr.open('GET', data_uri, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
    };

    var popstate = function(ev) {
        if (!(ev.state instanceof Object)) {
            return false;
        }
        var urls = {};
        for (var id in ev.state) {
            (function (state, model) {
                if (models && !(data_uri in urls) && state.data_href) {
                    var data_uri = state.data_href;
                    urls[data_uri] = true;
                    fetch(data_uri, null, model);
                }
            })(ev.state[id], models[id]);
        }
    };

    var Model = function(root, selector) {
        /*
        Create a view model that is associated the root element with a
        selector for the immediate node that will be updated via JSON.
        */

        this.selector = selector || 'div';

        this.root = root;
        this.state_id = default_state_id;
        this.populate_handlers = null;

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

        if (this.config && this.config.hooks instanceof Array) {
            hook.amd_call_map(this, this.config.hooks);
        }

        if (history.has_push_state) {
            window.addEventListener('popstate', popstate, false);
        }

    };

    Model.prototype.update = function(data_uri, href) {
        /*
        Standard fetch and populate for a given model
        */
        // TODO see if alternative (config provided) update methods can
        // also be supported.
        fetch(data_uri, href, this);
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
        history.replace(this.state_id, this.data_href);

        // Always need the href because this is _the_ canonical URI for
        // the target resource.
        var href = ev.target.attributes.getNamedItem('href').value;
        // The data-href is what will provide the data for the template;
        // done so as an explicit marker, and also that browsers are bad
        // at dealing with caching of multiple hypermedia types provided
        // by the same URI.
        var data_uri = ev.target.attributes.getNamedItem('data-href').value;

        this.update(data_uri, href);
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
            return get_model(obj.nunja_model_id).trigger_populate(obj, cb);
            // TODO provide with user feedback on errors.
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

    // XXX this really should be attached as an event, but given that
    // how wildly different events are done across browser versions, do
    // this as a shortcut for now.
    Model.prototype.trigger_populate = function(obj, cb) {
        if (this.populate_handlers instanceof Array) {
            var self = this;
            var populate = function(obj, cb) {
                return self.populate(obj, cb);
            };

            this.populate_handlers.forEach(function(handler) {
                // pass in the populate function of this instance, if
                // the handler feels like calling it.
                handler.apply(populate, [obj, cb]);
            });
            // this stops the push state if no handlers
            // TODO provide better feedback on why nothing happened.
            // TODO consider just fallback and continue on the standard
            // link click action.
            return this.populate_handlers.length > 0;
        }
        else {
            this.populate(obj, cb);
            return true;
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
        'fetch': fetch,
        'get_model': get_model,
        'init': init
    };
});
