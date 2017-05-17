# -*- coding: utf-8 -*-
from nunja.stock.model.base import Definition
from nunja.stock.model import breadcrumb
from nunja.stock.testing.case import ExamplesTestCase


class SimpleTestCase(ExamplesTestCase):

    maxDiff = None
    test_examples = 'breadcrumb_examples.js'

    def setUp(self):
        self.breadcrumb = breadcrumb.Simple(Definition(
            'model_id', 'https://example.com{+path}'))

    def test_root_item(self):
        self.assertDataEqual('root item', self.breadcrumb.get_breadcrumb(
            'https://example.com/'))

    def test_two_items(self):
        self.assertDataEqual('two items', self.breadcrumb.get_breadcrumb(
            '/documents/item'))

    def test_two_items_relative_path(self):
        self.assertDataEqual('two items', self.breadcrumb.get_breadcrumb(
            'documents/item'))
