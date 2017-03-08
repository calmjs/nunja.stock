# -*- coding: utf-8 -*-
import unittest
from os import makedirs
from os.path import join
from os.path import pardir
from os.path import sep

from nunja.stock.model import fsnav

from calmjs.testing.utils import mkdtemp
from nunja.stock.testing.case import ExamplesTestCase


def _dict_clone_filtered(value, filtered=['created']):
    items = value.items() if isinstance(value, dict) else value
    return {k: v for k, v in items if k not in filtered}


class MiscTestCase(unittest.TestCase):

    def test_to_filetype(self):
        self.assertEqual(fsnav.to_filetype(0o100000), 'file')
        self.assertEqual(fsnav.to_filetype(0o40000), 'folder')
        self.assertEqual(fsnav.to_filetype(0), 'unknown')


class FSNavTreeModelTestCase(unittest.TestCase):

    def setUp(self):
        self.tmpdir = mkdtemp(self)
        self.dummydir1 = join(self.tmpdir, 'dummydir1')
        self.dummydir2 = join(self.tmpdir, 'dummydir2')
        self.dummydir23 = join(self.tmpdir, 'dummydir2', 'dummydir3')

        makedirs(self.dummydir1)
        makedirs(self.dummydir2)
        makedirs(self.dummydir23)

        self.test_file = join(self.tmpdir, 'test_file.txt')
        self.dummydirfile1 = join(self.dummydir2, 'file1')
        self.dummydirfile2 = join(self.dummydir2, 'file2')

        with open(self.test_file, 'w') as fd:
            fd.write('test_file.txt contents')

        with open(self.dummydirfile1, 'w') as fd:
            fd.write('dummydirfile1')

        with open(self.dummydirfile2, 'w') as fd:
            fd.write('dummydirfile2')

    def tearDown(self):
        pass

    def test_base_get_filetype(self):
        self.assertEqual(fsnav.get_filetype(self.dummydir1), 'folder')
        self.assertEqual(fsnav.get_filetype(self.test_file), 'file')

    def test_base_model_initialize(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(model.nunja_model_id, 'fsnav')
        self.assertEqual(len(model.active_keys), 4)
        self.assertEqual(model.css_class, {})

        model = fsnav.Base(
            'fsnav', self.tmpdir, '/script.py?{path}', active_keys=['size'])
        self.assertEqual(len(model.active_keys), 1)
        self.assertIsNone(model.anchor_key)

        model = fsnav.Base(
            'fsnav', self.tmpdir, '/script.py?{path}', css_class={
                'table': 'tbl main'})
        self.assertEqual(model.css_class, {'table': 'tbl main'})

        model = fsnav.Base(
            'fsnav', self.tmpdir, '/script.py?{path}', anchor_key='name')
        self.assertEqual(model.anchor_key, 'name')

    def test_finalize(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
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

        # apply the class directly to the model
        model.css_class = {'table': 'some-table'}
        value = {'meta': {'css_class': {'test': 'class'}}}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'fsnav',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'test': 'class', 'table': 'some-table'},
            },
        })

        # apply the class directly to the model
        model.css_class = {'table': 'some-table'}
        # the provided value has priority
        value = {'meta': {'css_class': {'table': 'provided'}}}
        self.assertEqual(model.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'fsnav',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'table': 'provided'},
            },
        })

    def test_finalize_config(self):
        model = fsnav.Base(
            'static',
            self.tmpdir, '/script.py?{path}', config={'key1': 'value1'})
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
        model = fsnav.Base('static', self.tmpdir, '/script.py?{path}')

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

    def test_format_uri_root(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/',
            model.format_uri('/'),
        )

    def test_format_uri_path(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/some/path',
            model.format_uri('/some/path'),
        )

    def test_fs_path_format_uri_root(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/',
            model._fs_path_format_uri(self.tmpdir),
        )

    def test_fs_path_format_uri_file(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/dummydir2/file1',
            model._fs_path_format_uri(self.dummydirfile1),
        )

    def test_fs_path_format_uri_pardir(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/dummydir2/',
            model._fs_path_format_uri(join(self.dummydir23, pardir)),
        )

    def test_get_attrs(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.test_file)), {
                '@type': 'CreativeWork',
                'alternativeType': 'file',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'href': '/script.py?/test_file.txt'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydir1), [
                'created', 'size',
            ]), {
                '@type': 'ItemList',
                'alternativeType': 'folder',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1/'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydirfile1)), {
                '@type': 'CreativeWork',
                'alternativeType': 'file',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'href': '/script.py?/dummydir2/file1'
            }
        )

    def test_listdir(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        self.assertEqual(sorted(model.listdir(sep)), [])

        # No issue between this or the one with a separtor
        self.assertEqual(sorted(model.listdir(self.tmpdir)), [
            'dummydir1', 'dummydir2', 'test_file.txt'])
        self.assertEqual(sorted(model.listdir(self.tmpdir + sep)), [
            'dummydir1', 'dummydir2', 'test_file.txt'])

        self.assertEqual(sorted(model.listdir(self.dummydir1)), ['..'])

        self.assertEqual(sorted(model.listdir(self.dummydir2)), [
            '..', 'dummydir3', 'file1', 'file2'])

    def test_get_attrs_data(self):
        model = fsnav.Base(
            'fsnav',
            self.tmpdir, '/script.py?{path}',
            uri_template_json='/json.py{path}',
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.test_file)), {
                '@type': 'CreativeWork',
                'alternativeType': 'file',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'href': '/script.py?/test_file.txt',
                'data_href': '/json.py/test_file.txt',
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydir1), [
                'created', 'size',
            ]), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1/',
                'data_href': '/json.py/dummydir1/',
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydirfile1)), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'href': '/script.py?/dummydir2/file1',
                'data_href': '/json.py/dummydir2/file1',
            }
        )

    def test_get_attrs_data_pardir(self):
        # for the case where legitimate parent dir entry is required

        model = fsnav.Base(
            'fsnav',
            self.tmpdir, '/script.py?{path}',
            uri_template_json='/json.py{path}',
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(
                join(self.dummydir2, pardir)
            )), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                'size': 0,
                '@id': '..',
                'name': '..',
                'data_href': '/json.py/',
                'href': '/script.py?/',
            }
        )

    def test_get_struct_file(self):
        model = fsnav.Base(
            'fsnav', self.tmpdir, '/script.py?{path}', active_keys=[
                'alternativeType', 'name', 'size'])

        self.assertEqual(
            _dict_clone_filtered(model._get_struct_file(self.test_file)[
                'mainEntity'
            ]), {
                'alternativeType': 'file',
                '@type': 'CreativeWork',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'href': '/script.py?/test_file.txt',
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
                'href': '/script.py?/dummydir2/file1',
                'rownames': ['alternativeType', 'name', 'size'],
                'rows': [['file'], ['file1'], [13]],
            }
        )

    def test_get_struct_dir(self):
        model = fsnav.Base(
            'fsnav', self.tmpdir, '/script.py?{path}', anchor_key='name')

        result = model._get_struct_dir(self.dummydir1)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
                'created', 'size', 'itemListElement',
            ]), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1/',

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

        result = model._get_struct_dir(self.dummydir2)
        self.assertEqual(_dict_clone_filtered(result['mainEntity'], [
                'created', 'size', 'itemListElement',
            ]), {
                'alternativeType': 'folder',
                '@type': 'ItemList',
                '@id': 'dummydir2',
                'name': 'dummydir2',
                'href': '/script.py?/dummydir2/',

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

    def test_path_to_fs_path(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.path_to_fs_path('welp')

        result = model.path_to_fs_path('/readme.txt')
        self.assertTrue(result.startswith(self.tmpdir))
        self.assertTrue(result.endswith('readme.txt'))

    def test_get_struct(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        missing = model.get_struct('/readme.txt')
        self.assertIn('error', missing)

    def test_get_struct_errors(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        errored = model.get_struct('/readme.txt')
        self.assertEqual(errored['error'], 'path "/readme.txt" not found')

    def test_get_struct_file_success(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        results = model.get_struct('/test_file.txt')
        self.assertEqual(results['mainEntity']['size'], 22)

    def test_get_struct_dir_success(self):
        model = fsnav.Base('fsnav', self.tmpdir, '/script.py?{path}')
        results = model.get_struct('/dummydir2')
        self.assertEqual(len(results['mainEntity']['itemListElement']), 4)


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
            'fsnav',
            self.tmpdir, '/script.py?{path}', active_keys=[
                'name', 'alternativeType', 'size',
            ]
        )
        results = model.get_struct('/dummydir2')
        self.assertDataEqual('standard dir rendering', results)

    def test_get_struct_dir_success_limited_columns_with_data(self):
        model = fsnav.Base(
            'fsnav',
            self.tmpdir, '/script.py?{path}',
            uri_template_json='/json.py?{path}',
            active_keys=[
                'name', 'alternativeType', 'size',
            ]
        )
        results = model.get_struct('/dummydir2')
        self.assertDataEqual('configured dir rendering', results)

    def test_get_struct_file_success_limited_columns_no_data(self):
        model = fsnav.Base(
            'fsnav',
            self.tmpdir, '/script.py?{path}', active_keys=[
                'name', 'alternativeType', 'size',
            ]
        )
        self.maxDiff = None
        results = model.get_struct('/dummydir2/file1')
        self.assertDataEqual('standard file rendering', results)

    def test_get_struct_file_success_limited_columns_with_data(self):
        model = fsnav.Base(
            'fsnav',
            self.tmpdir, '/script.py?{path}',
            uri_template_json='/json.py?{path}',
            active_keys=[
                'name', 'alternativeType', 'size',
            ]
        )
        self.maxDiff = None
        results = model.get_struct('/dummydir2/file1')
        self.assertDataEqual('configured file rendering', results)
