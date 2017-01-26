# -*- coding: utf-8 -*-
import unittest
import json
from pkg_resources import resource_filename

from nunja.core import engine


with open(resource_filename(
        'nunja.stock.tests', 'fsnavtree_examples.js')) as fd:
    data = json.load(fd)


class FSNavTreeRenderTestCase(unittest.TestCase):

    def test_render(self):
        # TODO build a better comparison that enable the sharing of
        # rendered result between python and node.js
        with open(resource_filename(
                'nunja.stock.tests', 'fsnavtree_rendered.html')) as fd:
            answer = fd.read()
        rendered = engine.execute('nunja.stock.molds/navtree', data=data[0])
        self.assertEqual(rendered.strip(), answer.strip())
