# -*- coding: utf-8 -*-
"""
Base server-side UI component model
"""

import json
from collections import namedtuple

from uritemplate import URITemplate


def clone_dict(d):
    result = {}
    if d:
        if isinstance(d, dict):
            result.update(d)
        else:
            try:
                v = json.loads(d)
            except Exception:
                v = NotImplemented
            if not isinstance(v, dict):
                raise TypeError(
                    'provided value must be falsy, a dict, or a string '
                    'encoding a JSON object'
                )
            result.update(v)
    return result


class Definition(namedtuple('Definition', [
        'nunja_model_id',
        'uri_template', 'uri_template_json',
        'uri_template_tmpl', 'uri_template_json_tmpl',
        'css_class', 'config', 'context',
        ])):
    """
    A frozen definition for the construction of the model/schema.

    nunja_model_id
        The id of the element - will be persisted into the template
        as the id for the container node.  This should be equivalent to
        xml:id (i.e. unique across all resource(s) provided at a given
        URI/IRI).

    uri_template
        This is the template for all the URIs that will be generated
        for all the navigational links.  It should follow the
        convention set forth by RFC 6570.

        see the method ``format_uri`` for details.

    uri_template_json
        This is the template for all the URIs that will be generated
        for all the navigational links for getting to the JSON for
        that particular record, if set to a specific string.

        If True is set, the uri_template will be used as is with the
        json_cache_suffix applied.

        If a falsy value is set, no uri_template_json will be defined
        and this typically mean no data-href will be provided.

        Defaults to None

    json_cache_suffix
        A string that will be appended to the default uri_template_json
        as it would be identical to uri_template.  Set this to an empty
        string if the browser cache workaround is not required.

        Defaults to: '?'

    css_class
        The attributes for the css classes

    config
        Extra configuration for the template.  Provided either as JSON
        string or a dict that can be encoded as JSON.

    context
        The context for the linked data.
        Defaults to https://schema.org
    """

    __slots__ = ()

    def __new__(
            cls,
            nunja_model_id, uri_template, uri_template_json=None,
            json_cache_suffix='?',
            css_class=None, config=None, context='https://schema.org/',
            ):

        if uri_template_json is True:
            uri_template_json = uri_template + json_cache_suffix

        uri_template_json_tmpl = None
        if uri_template_json:
            uri_template_json_tmpl = URITemplate(uri_template_json)

        inst = cls.__bases__[0].__new__(
            cls,
            nunja_model_id, uri_template, uri_template_json,
            URITemplate(uri_template), uri_template_json_tmpl,
            clone_dict(css_class), clone_dict(config), context,
        )
        return inst

    def finalize(self, obj):
        config = clone_dict(self.config)
        config.update(obj.get('nunja_model_config', {}))

        # XXX This is a big huge crutch for now to get an independent
        # end point.  Must make decision on how to address this, either
        # keep and refactor out to external method, or figure out the
        # proper ontological term to represent this within the system.
        if 'data_href' in obj.get('mainEntity', {}):
            config['data_href'] = obj['mainEntity']['data_href']

        meta = obj.get('meta', {})
        # XXX Ditto for CSS class, as this is a mutable type.
        css_class = clone_dict(self.css_class)
        css_class.update(meta.get('css_class', {}))
        meta['css_class'] = css_class

        obj['meta'] = meta
        obj['nunja_model_config'] = config
        obj['nunja_model_id'] = self.nunja_model_id
        obj['@context'] = obj.get('@context', self.context)
        return obj

    # TODO add property for the first explode key for path?

    def format_href(self, **kw):
        """
        Default implementation for href, which expands the uri_template
        with the provided arguments
        """

        return self.uri_template_tmpl.expand(**kw)

    def format_data_href(self, **kw):
        """
        Default implementation for data-href, same as format_href, with
        uri_template_json instead.
        """

        return self.uri_template_json_tmpl.expand(**kw)


class Base(object):
    """
    A simple base implmenetation that include just one definition.
    """

    def __init__(self, definition):
        self.definition = definition

    def finalize(self, obj):
        return self.definition.finalize(obj)
