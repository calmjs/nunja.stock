# -*- coding: utf-8 -*-
import unittest
import json

from pkg_resources import resource_filename

from calmjs.rjs.ecma import parse

from nunja.stock.model import base
from nunja.stock.model import breadcrumb


class SimpleTestCase(unittest.TestCase):

    maxDiff = None

    @classmethod
    def setUpClass(cls):
        with open(resource_filename(
                'nunja.stock.tests', 'breadcrumb_examples.js')) as fd:
            cls.data = json.loads(parse(fd.read()).children()[0].children(
                )[0].initializer.to_ecma())

    def test_root_item(self):
        data = self.data['root item'][0]
        bc = breadcrumb.Simple(base.Definition(
            'model_id', 'https://example.com{+path}'))
        self.assertEqual(bc.get_breadcrumb('https://example.com/'), data)

    def test_two_items(self):
        data = self.data['two items'][0]
        bc = breadcrumb.Simple(base.Definition(
            'model_id', 'https://example.com{+path}'))
        self.assertEqual(bc.get_breadcrumb('/documents/item'), data)
