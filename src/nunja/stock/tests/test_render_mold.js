'use strict';

var loader = require('nunja/stock/tests/loader');

window.mocha.setup('bdd');


loader.generate_test(
    'nunja.stock.molds/navtree rendering from JSON module',
    'nunja.stock.molds/navtree',
    'nunja/stock/tests/fsnavtree_examples'
);
