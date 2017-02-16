'use strict';

var loader = require('nunja/stock/tests/loader');

window.mocha.setup('bdd');


loader.generate_test(
    'nunja.stock.molds/navtree rendering from JSON module',
    'nunja.stock.molds/navtree',
    'nunja/stock/tests/fsnav_examples'
);


loader.generate_test(
    'nunja.stock.molds/grid rendering from JSON module',
    'nunja.stock.molds/grid',
    'nunja/stock/tests/grid_examples'
);
