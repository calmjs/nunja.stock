'use strict';

window.addEventListener("load", function(event) {
    require(['nunja/core'], function(core) {
        console.log('loaded');
        core.engine.do_onload(document.body);
    });
});
