# -*- coding: utf-8 -*-
from nunja.stock.testing.loader import generate_test


GridRenderTestCase = generate_test(
    name='GridRenderTestCase',
    mold_id='nunja.stock.molds/grid',
    test_module_ns='nunja.stock.tests',
    data_module='grid_examples',
)


NavGridRenderTestCase = generate_test(
    name='NavGridRenderTestCase',
    mold_id='nunja.stock.molds/navgrid',
    test_module_ns='nunja.stock.tests',
    data_module='navgrid_examples',
)


ModelRenderTestCase = generate_test(
    name='ModelRenderTestCase',
    mold_id='nunja.stock.molds/model',
    test_module_ns='nunja.stock.tests',
    data_module='model_examples',
)


ModelNavGridRenderTestCase = generate_test(
    name='ModelNavGridRenderTestCase',
    mold_id='nunja.stock.molds/model',
    test_module_ns='nunja.stock.tests',
    data_module='model_navgrid_examples',
)
