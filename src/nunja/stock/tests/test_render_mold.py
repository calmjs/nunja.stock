# -*- coding: utf-8 -*-
from nunja.stock.testing.loader import generate_test


FSNavTreeRenderTestCase = generate_test(
    name='FSNavTreeRenderTestCase',
    mold_id='nunja.stock.molds/navtree',
    test_module_ns='nunja.stock.tests',
    data_module='fsnavtree_examples',
)


GridRenderTestCase = generate_test(
    name='GridRenderTestCase',
    mold_id='nunja.stock.molds/grid',
    test_module_ns='nunja.stock.tests',
    data_module='grid_examples',
)
