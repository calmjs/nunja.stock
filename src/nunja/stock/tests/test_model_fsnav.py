# -*- coding: utf-8 -*-
import unittest
from os import makedirs
from os.path import join
from os.path import pardir
from os.path import sep

from nunja.stock.model.base import Definition
from nunja.stock.model import fsnav

from calmjs.testing.utils import mkdtemp
from nunja.stock.testing.case import ExamplesTestCase


def _dict_clone_filtered(value, filtered=['created']):
    items = value.items() if isinstance(value, dict) else value
    return {k: v for k, v in items if k not in filtered}


def create_test_data(testcase):
    testcase.tmpdir = mkdtemp(testcase)
    testcase.dummydir1 = join(testcase.tmpdir, 'dummydir1')
    testcase.dummydir2 = join(testcase.tmpdir, 'dummydir2')
    testcase.dummydir23 = join(testcase.tmpdir, 'dummydir2', 'dummydir3')

    makedirs(testcase.dummydir1)
    makedirs(testcase.dummydir2)
    makedirs(testcase.dummydir23)

    testcase.test_file = join(testcase.tmpdir, 'test_file.txt')
    testcase.dummydirfile1 = join(testcase.dummydir2, 'file1')
    testcase.dummydirfile2 = join(testcase.dummydir2, 'file2')

    with open(testcase.test_file, 'w') as fd:
        fd.write('test_file.txt contents')

    with open(testcase.dummydirfile1, 'w') as fd:
        fd.write('dummydirfile1')

    with open(testcase.dummydirfile2, 'w') as fd:
        fd.write('dummydirfile2')


class MiscTestCase(unittest.TestCase):

    def test_to_filetype(self):
        self.assertEqual(fsnav.to_filetype(0o100000), 'file')
        self.assertEqual(fsnav.to_filetype(0o40000), 'folder')
        self.assertEqual(fsnav.to_filetype(0), 'unknown')

    def test_base_get_filetype(self):
        create_test_data(self)
        self.assertEqual(fsnav.get_filetype(self.dummydir1), 'folder')
        self.assertEqual(fsnav.get_filetype(self.test_file), 'file')


class FSModelTestCase(unittest.TestCase):

    def setUp(self):
        create_test_data(self)

    def tearDown(self):
        pass

    def test_get_attrs(self):
        model = fsnav.FSModel(self.tmpdir)

        self.assertEqual(
            _dict_clone_filtered(model.get_attrs(self.test_file)), {
                '@type': 'CreativeWork',
                'alternativeType': 'file',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'path': '/test_file.txt'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model.get_attrs(self.dummydir1), [
                'created', 'size',
            ]), {
                '@type': 'ItemList',
                'alternativeType': 'folder',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'path': '/dummydir1/'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model.get_attrs(self.dummydirfile1)), {
                '@type': 'CreativeWork',
                'alternativeType': 'file',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'path': '/dummydir2/file1'
            }
        )

    def test_get_attrs_data_pardir(self):
        # for the case where legitimate parent dir entry is required
        model = fsnav.FSModel(self.tmpdir)
        self.assertEqual(
            _dict_clone_filtered(model.get_attrs(
                join(self.dummydir2, pardir)
            )), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                'size': 0,
                '@id': '..',
                'name': '..',
                'path': '/',
            }
        )

    def test_path_to_fs_path(self):
        model = fsnav.FSModel(self.tmpdir)
        with self.assertRaises(ValueError):
            model.path_to_fs_path('welp')

        result = model.path_to_fs_path('/readme.txt')
        self.assertTrue(result.startswith(self.tmpdir))
        self.assertTrue(result.endswith('readme.txt'))

    def test_listdir(self):
        model = fsnav.FSModel(self.tmpdir)
        self.assertEqual(sorted(model._listdir(sep)), [])

        # No issue between this or the one with a separtor
        self.assertEqual(sorted(model._listdir(self.tmpdir)), [
            'dummydir1', 'dummydir2', 'test_file.txt'])
        self.assertEqual(sorted(model._listdir(self.tmpdir + sep)), [
            'dummydir1', 'dummydir2', 'test_file.txt'])

        self.assertEqual(sorted(model._listdir(self.dummydir1)), ['..'])

    def test_get_struct_dir_empty(self):
        model = fsnav.FSModel(self.tmpdir)
        result = model.get_struct(self.dummydir1)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
            'created', 'size', 'itemListElement',
        ]), {
            'alternativeType': 'folder',
            '@type': 'ItemList',
            '@id': 'dummydir1',
            'name': 'dummydir1',
            'path': '/dummydir1/',
        })
        self.assertEqual(len(result['mainEntity']['itemListElement']), 1)
        self.assertEqual(
            result['mainEntity']['itemListElement'][0]['name'], '..')
        self.assertEqual(
            result['mainEntity']['itemListElement'][0]['path'], '/')

    def test_get_struct_dir_contents(self):
        model = fsnav.FSModel(self.tmpdir)
        result = model.get_struct(self.dummydir2)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
            'created', 'size', 'itemListElement',
        ]), {
            'alternativeType': 'folder',
            '@type': 'ItemList',
            '@id': 'dummydir2',
            'name': 'dummydir2',
            'path': '/dummydir2/',
        })
        self.assertEqual(len(result['mainEntity']['itemListElement']), 4)

    def test_get_struct_file(self):
        model = fsnav.FSModel(self.tmpdir)

        self.assertEqual(
            _dict_clone_filtered(model.get_struct(self.test_file)[
                'mainEntity'
            ]), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'path': '/test_file.txt',
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model.get_struct(self.dummydirfile1)[
                'mainEntity'
            ]), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'path': '/dummydir2/file1',
            }
        )

    def test_get_struct_error(self):
        model = fsnav.FSModel(self.tmpdir)
        with self.assertRaises(OSError):  # FileNotFoundError
            model.get_struct('/no_such_dir')

        with self.assertRaises(OSError):  # FileNotFoundError
            model.get_struct('/no_such_dir')


class FSNavTreeModelTestCase(unittest.TestCase):

    def setUp(self):
        create_test_data(self)

    def tearDown(self):
        pass

    def test_base_model_initialize(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        self.assertEqual(len(model.active_keys), 4)

        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir,
            active_keys=['size'])
        self.assertEqual(len(model.active_keys), 1)
        self.assertIsNone(model.anchor_key)

        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir,
            anchor_key='name')
        self.assertEqual(model.anchor_key, 'name')

    def test_finalize(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        self.assertEqual(model.finalize({}), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'fsnav',
            'nunja_model_config': {},
            'meta': {
                'css_class': {},
            },
        })
        value = {'meta': {'css_class': {'test': 'class'}}}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'fsnav',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'test': 'class'},
            },
        })

    def test_finalize_config(self):
        model = fsnav.Base(
            Definition('static', '/script.py?{+path}', config={
                'key1': 'value1'}),
            self.tmpdir,
        )
        self.assertEqual(model.finalize({}), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'static',
            'nunja_model_config': {"key1": "value1"},
            'meta': {
                'css_class': {},
            },
        })

        value = {
            'nunja_model_id': 'replaced',
            'nunja_model_config': {'key2': 'value2'},
            'meta': {
                'css_class': {'test': 'class'},
            },
        }
        finalized = model.finalize(value)
        self.assertEqual(finalized['nunja_model_id'], 'static')
        self.assertEqual(finalized['meta']['css_class'], {'test': 'class'})
        self.assertEqual(finalized['nunja_model_config'], {
            "key1": "value1", "key2": "value2"})

        value = {
            'meta': {'css_class': {'test': 'class'}},
            'nunja_model_config': {'key1': 'alternative'},
        }
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'static',
            'nunja_model_config': {"key1": "alternative"},
            'meta': {
                'css_class': {'test': 'class'},
            },
        })

    def test_finalize_value_result(self):
        model = fsnav.Base(
            Definition('static', '/script.py?{+path}'), self.tmpdir)

        value = {'mainEntity': {}}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'static',
            'nunja_model_config': {},
            'meta': {
                'css_class': {},
            },
            'mainEntity': {},
        })

        value = {'mainEntity': {}, '@context': 'https://example.com/custom/'}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://example.com/custom/',
            'nunja_model_id': 'static',
            'nunja_model_config': {},
            'mainEntity': {},
            'meta': {
                'css_class': {},
            },
        })

        value = {'mainEntity': {'data_href': '/json.py?/somewhere'}}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'static',
            'nunja_model_config': {
                'data_href': '/json.py?/somewhere',
            },
            'mainEntity': {
                'data_href': '/json.py?/somewhere',
            },
            'meta': {
                'css_class': {},
            },
        })

    def test_get_struct_file(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'),
            self.tmpdir,
            active_keys=['alternativeType', 'name', 'size'],
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_struct_file(self.test_file)[
                'mainEntity'
            ]), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'url': '/script.py?/test_file.txt',
                'rownames': ['alternativeType', 'name', 'size'],
                'rows': [['file'], ['test_file.txt'], [22]],
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_struct_file(self.dummydirfile1)[
                'mainEntity'
            ]), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'url': '/script.py?/dummydir2/file1',
                'rownames': ['alternativeType', 'name', 'size'],
                'rows': [['file'], ['file1'], [13]],
            }
        )

    def test_get_struct_dir(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir,
            anchor_key='name')

        result = model._get_struct_dir(self.dummydir1, lambda x: True)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
                'created', 'size', 'itemListElement',
            ]), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'url': '/script.py?/dummydir1/',

                'key_label_map': {
                    'alternativeType': 'type',
                    'created': 'created',
                    'name': 'name',
                    'size': 'size',
                },
                'active_keys': ['alternativeType', 'name', 'size', 'created'],
                'anchor_key': 'name',
            }
        )
        self.assertEqual(len(result['mainEntity']['itemListElement']), 1)
        self.assertEqual(result['nunja_model_config'], {
            'mold_id': 'nunja.stock.molds/navgrid',
        })

        # TODO should test out the other conditions here, but this is
        # covered later with the specialized methods
        result = model._get_struct_dir(self.dummydir2, lambda x: True)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
                'created', 'size', 'itemListElement',
            ]), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                '@id': 'dummydir2',
                'name': 'dummydir2',
                'url': '/script.py?/dummydir2/',

                'key_label_map': {
                    'alternativeType': 'type',
                    'created': 'created',
                    'name': 'name',
                    'size': 'size',
                },
                'active_keys': ['alternativeType', 'name', 'size', 'created'],
                'anchor_key': 'name',
            }
        )
        self.assertEqual(result['nunja_model_config'], {
            'mold_id': 'nunja.stock.molds/navgrid',
        })
        self.assertEqual(len(result['mainEntity']['itemListElement']), 4)

    def test_get_struct(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        missing = model.get_struct('/readme.txt')
        self.assertIn('error', missing)

    def test_get_struct_errors(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        errored = model.get_struct('/readme.txt')
        self.assertEqual(errored['error'], 'path "/readme.txt" not found')

    def test_get_struct_file_success(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        results = model.get_struct('/test_file.txt')
        self.assertEqual(results['mainEntity']['size'], 22)

    def test_get_struct_dir_success(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        results = model.get_struct('/dummydir2')
        self.assertEqual(len(results['mainEntity']['itemListElement']), 4)

    def test_get_struct_dir_dirs(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        results = model.get_struct_dirs_only('/dummydir2')
        self.assertEqual(len(results['mainEntity']['itemListElement']), 2)

        # also for an item underneath
        results = model.get_struct_dirs_only('/dummydir2/something')
        self.assertEqual(len(results['mainEntity']['itemListElement']), 2)

    def test_get_struct_dir_files(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'), self.tmpdir)
        results = model.get_struct_files_only('/dummydir2')
        self.assertEqual(len(results['mainEntity']['itemListElement']), 2)


class FSNavTreeModelMirrorTestCase(ExamplesTestCase):

    test_examples = 'model_navgrid_examples.js'

    def setUp(self):
        self.tmpdir = mkdtemp(self)
        self.dummydir2 = join(self.tmpdir, 'dummydir2')
        self.dummydir2dir = join(self.tmpdir, 'dummydir2', 'dir')
        makedirs(self.dummydir2dir)
        self.dummydirfile1 = join(self.dummydir2, 'file1')
        self.dummydirfile2 = join(self.dummydir2, 'file2')

        with open(self.dummydirfile1, 'w') as fd:
            fd.write('dummydirfile1')

        with open(self.dummydirfile2, 'w') as fd:
            fd.write('dummydirfile2')

    def test_get_struct_dir_success_limited_columns_no_data(self):
        model = fsnav.Base(
            Definition('fsnav', '/script.py?{+path}'),
            self.tmpdir, active_keys=['name', 'alternativeType', 'size'],
        )
        results = model.get_struct('/dummydir2')
        self.assertDataEqual('standard dir rendering', results)

    def test_get_struct_dir_success_limited_columns_with_data(self):
        model = fsnav.Base(
            Definition(
                'fsnav', '/script.py?{+path}',
                uri_template_json='/json.py?{+path}',
            ),
            self.tmpdir, active_keys=['name', 'alternativeType', 'size'],
        )
        results = model.get_struct('/dummydir2')
        self.assertDataEqual('configured dir rendering', results)

    def test_get_struct_file_success_limited_columns_no_data(self):
        model = fsnav.Base(
            Definition(
                'fsnav', '/script.py?{+path}',
            ),
            self.tmpdir, active_keys=['name', 'alternativeType', 'size'],
        )
        self.maxDiff = None
        results = model.get_struct('/dummydir2/file1')
        self.assertDataEqual('standard file rendering', results)

    def test_get_struct_file_success_limited_columns_with_data(self):
        model = fsnav.Base(
            Definition(
                'fsnav', '/script.py?{+path}',
                uri_template_json='/json.py?{+path}',
            ),
            self.tmpdir, active_keys=['name', 'alternativeType', 'size'],
        )
        self.maxDiff = None
        results = model.get_struct('/dummydir2/file1')
        self.assertDataEqual('configured file rendering', results)
