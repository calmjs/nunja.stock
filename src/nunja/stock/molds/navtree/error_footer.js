define([], function() {
    'use strict';

    return function (model, xhr) {
        // XXX this is just a proof of concept.
        var footer = document.createElement('tfoot');
        footer.innerHTML = (
            '<tr><td>Error fetching content (' + xhr.status + ')</td></tr>');
        model.root.querySelector('table').appendChild(footer);
    };
});
