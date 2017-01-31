# -*- coding: utf-8 -*-
import unittest
from os import makedirs
from os.path import join

from nunja.stock.model import fsnavtree
from calmjs.testing.utils import mkdtemp


def _dict_clone_filtered(d, filtered=['created']):
    return {k: v for k, v in d.items() if k not in filtered}


class MiscTestCase(unittest.TestCase):

    def test_to_filetype(self):
        self.assertEqual(fsnavtree.to_filetype(0o100000), 'file')
        self.assertEqual(fsnavtree.to_filetype(0o40000), 'folder')
        self.assertEqual(fsnavtree.to_filetype(0), 'unknown')


class FSNavTreeModelTestCase(unittest.TestCase):

    def setUp(self):
        self.tmpdir = mkdtemp(self)
        self.dummydir1 = join(self.tmpdir, 'dummydir1')
        self.dummydir2 = join(self.tmpdir, 'dummydir2')

        makedirs(self.dummydir1)
        makedirs(self.dummydir2)

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
        self.assertEqual(fsnavtree.get_filetype(self.dummydir1), 'folder')
        self.assertEqual(fsnavtree.get_filetype(self.test_file), 'file')

    def test_base_model_initialize(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        self.assertEqual(len(model.active_columns), 4)
        model = fsnavtree.Base(
            self.tmpdir, '/script.py?{path}', active_columns=['size'])
        self.assertEqual(len(model.active_columns), 1)

    def test_finalize(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        self.assertEqual(model.finalize({}), {'cls': {}})
        value = {'cls': {'test': 'class'}}
        self.assertEqual(model.finalize(value), {'cls': {'test': 'class'}})

    def test_format_uri(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/some/path',
            model.format_uri('/some/path'),
        )

    def test_fs_format_uri(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        self.assertEqual(
            '/script.py?/dummydir2/file1',
            model._fs_format_uri(self.dummydirfile1),
        )

    def test_get_attrs(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.test_file)), {
                'type': 'file',
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
                'type': 'folder',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydirfile1)), {
                'type': 'file',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'href': '/script.py?/dummydir2/file1'
            }
        )

    def test_get_attrs_data(self):
        model = fsnavtree.Base(
            self.tmpdir, '/script.py?{path}',
            uri_template_json='/json.py{path}',
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.test_file)), {
                'type': 'file',
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
                'type': 'folder',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1',
                'data_href': '/json.py/dummydir1',
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_attrs(self.dummydirfile1)), {
                'type': 'file',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'href': '/script.py?/dummydir2/file1',
                'data_href': '/json.py/dummydir2/file1',
            }
        )

    def test_get_struct_file(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')

        self.assertEqual(
            _dict_clone_filtered(model._get_struct_file(self.test_file)[
                'result'
            ]), {
                'type': 'file',
                'size': 22,
                '@id': 'test_file.txt',
                'name': 'test_file.txt',
                'href': '/script.py?/test_file.txt'
            }
        )

        self.assertEqual(
            _dict_clone_filtered(model._get_struct_file(self.dummydirfile1)[
                'result'
            ]), {
                'type': 'file',
                'size': 13,
                '@id': 'file1',
                'name': 'file1',
                'href': '/script.py?/dummydir2/file1'
            }
        )

    def test_get_struct_dir(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')

        result = model._get_struct_dir(self.dummydir1)
        self.assertEqual(_dict_clone_filtered(result['result'], [
                'created', 'size', 'items',
            ]), {
                'type': 'folder',
                '@id': 'dummydir1',
                'name': 'dummydir1',
                'href': '/script.py?/dummydir1'
            }
        )
        self.assertEqual(len(result['result']['items']), 0)

        result = model._get_struct_dir(self.dummydir2)
        self.assertEqual(_dict_clone_filtered(result['result'], [
                'created', 'size', 'items',
            ]), {
                'type': 'folder',
                '@id': 'dummydir2',
                'name': 'dummydir2',
                'href': '/script.py?/dummydir2'
            }
        )
        self.assertEqual(len(result['result']['items']), 2)

    def test_path_to_fs_path(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.path_to_fs_path('welp')

        result = model.path_to_fs_path('/readme.txt')
        self.assertTrue(result.startswith(self.tmpdir))
        self.assertTrue(result.endswith('readme.txt'))

    def test_get_struct(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        missing = model.get_struct('/readme.txt')
        self.assertIn('error', missing)

    def test_get_struct_errors(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        with self.assertRaises(ValueError):
            model.get_struct('welp')

        errored = model.get_struct('/readme.txt')
        self.assertEqual(errored['error'], 'path "/readme.txt" not found')

    def test_get_struct_success(self):
        model = fsnavtree.Base(self.tmpdir, '/script.py?{path}')
        results = model.get_struct('/test_file.txt')
        self.assertEqual(results['result']['size'], 22)
        results = model.get_struct('/dummydir2')
        self.assertEqual(len(results['result']['items']), 2)

    def test_get_struct_success_limited_columns(self):
        model = fsnavtree.Base(
            self.tmpdir, '/script.py?{path}', active_columns=[
                'name', 'type', 'size',
            ]
        )
        self.maxDiff = None
        results = model.get_struct('/dummydir2')
        self.assertEqual(len(results['column_map']), 3)
        self.assertEqual(len(results['active_columns']), 3)
