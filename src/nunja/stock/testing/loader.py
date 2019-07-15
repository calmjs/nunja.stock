# -*- coding: utf-8 -*-
import unittest
import codecs
import json
from pkg_resources import resource_filename

from calmjs.parse import es5

from nunja.core import engine


def entity_name_to_number(s):
    # for turning html entity names into the numeric form that jinja2
    # escapes into (rather than the actual name like nunjucks does).
    # TODO provide a more generic solution rather than this on-demand
    # method.
    return s.replace('&quot;', '&#34;')


def reconstitute(lines):
    return '\n'.join(entity_name_to_number(s) for s in lines if s.strip())


def generate_test(name, mold_id, test_module_ns, data_module):
    """
    name
        Name of the TestCase subclass to create

    mold_id
        The mold_id to test

    test_module_ns
        The test module name to import the source data from

    data_module
        The name of the CommonJS module that exports the JSON to test
        with within the test_module_ns
    """

    def create_test_method(data, answer):
        def _method(self):
            raw = engine.execute(mold_id, data=data)
            self.assertEqual(
                reconstitute(answer), reconstitute(raw.splitlines()))

        return _method

    with codecs.open(
            resource_filename(test_module_ns, data_module + '.js'),
            encoding='utf8') as fd:
        data = json.loads(
            str(es5(fd.read()).children()[0].children()[0].initializer))

    attrs = {
        'maxDiff': None,
    }
    attrs.update({
        'test_' + t_name: create_test_method(*values)
        for t_name, values in data.items()
    })
    return type(name, (unittest.TestCase,), attrs)
