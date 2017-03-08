'use strict';

var loader = require('nunja/stock/tests/loader');

window.mocha.setup('bdd');


loader.generate_test(
    'nunja.stock.molds/breadcrumb rendering from JSON module',
    'nunja.stock.molds/breadcrumb',
    'nunja/stock/tests/breadcrumb_examples'
);


loader.generate_test(
    'nunja.stock.molds/grid rendering from JSON module',
    'nunja.stock.molds/grid',
    'nunja/stock/tests/grid_examples'
);


loader.generate_test(
    'nunja.stock.molds/navgrid rendering from JSON module',
    'nunja.stock.molds/navgrid',
    'nunja/stock/tests/navgrid_examples'
);


loader.generate_test(
    'nunja.stock.molds/model rendering from JSON module',
    'nunja.stock.molds/model',
    'nunja/stock/tests/model_examples'
);


loader.generate_test(
    'nunja.stock.molds/model navgrid rendering from JSON module',
    'nunja.stock.molds/model',
    'nunja/stock/tests/model_navgrid_examples'
);
