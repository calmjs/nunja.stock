# -*- coding: utf-8 -*-
import unittest

from nunja.stock.model import base


class DefinitionTestCase(unittest.TestCase):

    def test_definition_construction_simple(self):
        defn = base.Definition('model_id', 'https://example.com/{path}')
        self.assertEqual(defn.nunja_model_id, 'model_id')
        self.assertEqual(defn.uri_template, 'https://example.com/{path}')
        self.assertEqual(defn.uri_template_json, None)
        self.assertEqual(defn.css_class, {})
        self.assertEqual(defn.config, {})
        self.assertEqual(defn.context, 'https://schema.org/')

    def test_definition_construction_all_parameters(self):
        defn = base.Definition(
            'model_id', 'https://example.com/{path}',
            uri_template_json='https://example.com/{path}?',
            css_class={'body': 'tagged'},
            config={'extra_mold': 'nunja.example/mold'},
            context=[
                "http://schema.org",
                {"image": {"@id": "schema:image", "@type": "@id"}},
            ],
        )
        self.assertEqual(defn.nunja_model_id, 'model_id')
        self.assertEqual(defn.uri_template, 'https://example.com/{path}')
        self.assertEqual(defn.uri_template_json, 'https://example.com/{path}?')
        self.assertEqual(defn.css_class, {'body': 'tagged'})
        self.assertEqual(defn.config, {'extra_mold': 'nunja.example/mold'})
        self.assertEqual(defn.context, [
            "http://schema.org",
            {"image": {"@id": "schema:image", "@type": "@id"}},
        ])

    def test_definition_construction_error(self):
        with self.assertRaises(TypeError):
            base.Definition('model_id', '{path}', config='notdict')


class BaseTestCase(unittest.TestCase):

    def test_base_construction_simple(self):
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        self.assertEqual(obj.definition.nunja_model_id, 'model_id')

    def test_base_format_uri_template(self):
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/chapter/{chapter_id}/'))
        self.assertEqual(
            obj.format_uri(chapter_id='1'), 'https://example.com/chapter/1/')

    def test_base_finalize_simple(self):
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        result = obj.finalize({})
        self.assertEqual(result, {
            '@context': 'https://schema.org/',
            'nunja_model_config': {},
            'nunja_model_id': 'model_id',
            'meta': {'css_class': {}},
        })

    def test_base_finalize_data_href(self):
        # test WILL be redone once the treatment of data_href is
        # finalized
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        result = obj.finalize({
            'result': {'data_href': 'https://example.com/data'},
        })
        self.assertEqual(result, {
            '@context': 'https://schema.org/',
            'nunja_model_config': {
                'data_href': 'https://example.com/data',
            },
            'nunja_model_id': 'model_id',
            'meta': {
                'css_class': {},
            },
            'result': {
                'data_href': 'https://example.com/data',
            },
        })
