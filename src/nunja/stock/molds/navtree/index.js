define([
    'nunja/core',
    'nunja/utils'
], function(core, utils) {
    'use strict';

    var $ = utils.$;
    var addEventListeners = utils.addEventListeners;

    var Model = function(root) {
        this.root = root;
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
    }

    Model.prototype.json_nav = function(ev) {
        var self = this;
        var uri = ev.target.attributes.getNamedItem('data-href').value;
        var config = {};
        try {
            config = JSON.parse(self.root.querySelector('div').getAttribute(
                'data-config'));
        } catch (e) {}
        this.get(uri, function(xhr) {
            var obj = JSON.parse(xhr.responseText);
            core.engine.populate(self.root, obj, function() {
                // reinitialize the hooks for the new elements.
                self.init();
            });
        }, config.error_handler);
        ev.preventDefault();
        return false;
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
