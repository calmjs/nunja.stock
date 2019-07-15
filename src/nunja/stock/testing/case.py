# -*- coding: utf-8 -*-
import codecs
import json
import unittest

from pkg_resources import resource_filename

from calmjs.parse import es5


class ExamplesTestCase(unittest.TestCase):
    """
    A test case that automatically load the examples JS module into the
    data attribute for the test instance, and to provide a shortcut for
    doing assertions.
    """

    data = None
    test_module_name = 'nunja.stock.tests'
    test_examples = NotImplemented

    @classmethod
    def setUpClass(cls):
        if cls.test_examples is NotImplemented:
            raise ValueError(
                'the class must define the test_examples attribute for data')

        with codecs.open(
                resource_filename(cls.test_module_name, cls.test_examples),
                encoding='utf8') as fd:
            cls.data = json.loads(str(es5(fd.read()).children()[0].children(
                )[0].initializer))
            # TODO also sanity check the resulting object?

    def assertDataEqual(self, key, result):
        answer = self.data[key][0]
        self.assertEqual(answer, result)
