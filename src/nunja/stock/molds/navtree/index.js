define([
    'nunja/core',
    'nunja/utils'
], function(core, utils) {
    'use strict';

    var $ = utils.$;
    var addEventListeners = utils.addEventListeners;

    var get = function(uri, cb) {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function() {
            if (xhr.readyState == XMLHttpRequest.DONE) {
                if (xhr.status == 200) {
                    cb(xhr);
                }
                else {
                    console.error(uri + ' -> error ' + xhr.status);
                }
            }
        };
        xhr.open('GET', uri, true);
        xhr.setRequestHeader('Accept', 'application/json');
        xhr.send();
    }

    var init = function(self) {
        addEventListeners($('[data-href]', self), 'click', function(ev) {
            json_nav(self, ev);
        });
    };

    var json_nav = function(self, ev) {
        var uri = ev.target.attributes.getNamedItem('data-href').value;
        get(uri, function(xhr) {
            var obj = JSON.parse(xhr.responseText);
            core.engine.populate(self, obj);
            init(self);  // reinitialize the hooks for the new elements.
        });
        ev.preventDefault();
        return false;
    };

    return {
        'init': init,
    };
});
