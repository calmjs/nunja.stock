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

    def test_definition_format_href_template(self):
        defn = base.Definition(
            'model_id', 'https://example.com/chapter/{chapter_id}/')
        self.assertEqual(
            defn.format_href(chapter_id='1'), 'https://example.com/chapter/1/')

    def test_definition_format_data_href_template(self):
        defn = base.Definition(
            'model_id',
            'https://example.com/chapter/{chapter_id}/',
            uri_template_json='https://api.example.com/chapter/{chapter_id}/',
        )
        self.assertEqual(
            defn.format_data_href(chapter_id='1'),
            'https://api.example.com/chapter/1/')


class BaseTestCase(unittest.TestCase):

    def test_base_construction_simple(self):
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        self.assertEqual(obj.definition.nunja_model_id, 'model_id')

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

    def test_finalize_css(self):
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        value = {'meta': {'css_class': {'test': 'class'}}}
        self.assertEqual(obj.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'model_id',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'test': 'class'},
            },
        })

        # apply the class directly to the model
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}',
            css_class={'table': 'some-table'}
        ))
        value = {'meta': {'css_class': {'test': 'class'}}}
        self.assertEqual(obj.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'model_id',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'test': 'class', 'table': 'some-table'},
            },
        })

        # apply the class directly to the model
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}',
            css_class={'table': 'some-table'}
        ))
        value = {'meta': {'css_class': {'test': 'class'}}}
        self.assertEqual(obj.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'model_id',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'test': 'class', 'table': 'some-table'},
            },
        })

        value = {'meta': {'css_class': {'table': 'provided'}}}
        self.assertEqual(obj.finalize(value), {
            '@context': 'https://schema.org/',
            'nunja_model_id': 'model_id',
            'nunja_model_config': {},
            'meta': {
                'css_class': {'table': 'provided'},
            },
        })

    def test_base_finalize_data_href(self):
        # test WILL be redone once the treatment of data_href is
        # finalized
        obj = base.Base(base.Definition(
            'model_id', 'https://example.com/{path}'))
        result = obj.finalize({
            'mainEntity': {'data_href': 'https://example.com/data'},
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
            'mainEntity': {
                'data_href': 'https://example.com/data',
            },
        })
