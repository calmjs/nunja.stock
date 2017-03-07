# -*- coding: utf-8 -*-
"""
Base server-side UI component model
"""

from collections import namedtuple

from uritemplate import expand


def clone_dict(d):
    o = {}
    if d:
        if not isinstance(d, dict):
            raise TypeError('provided value must be falsy or dict')
        o.update(d)
    return o


class Definition(namedtuple('Definition', [
        'nunja_model_id', 'uri_template', 'uri_template_json',
        'css_class', 'config', 'context',
        ])):
    """
    nunja_model_id
        The id of the element - will be persisted into the template
        as the id for the container node.

    uri_template
        This is the template for all the URIs that will be generated
        for all the navigational links.  It should follow the
        convention set forth by RFC 6570.

        see the method ``format_uri`` for details.

    uri_template_json
        This is the template for all the URIs that will be generated
        for all the navigational links for getting to the JSON for
        that particular record.

        Defaults to unspecified

    css_class
        The attributes for the css classes

    config
        Extra configuration for the template.

    context
        The context for the linked data.
        Defaults to https://schema.org
    """

    __slots__ = ()

    def __new__(
            cls,
            nunja_model_id, uri_template, uri_template_json=None,
            css_class=None, config=None, context='https://schema.org/',
            ):

        return cls.__bases__[0].__new__(
            cls,
            nunja_model_id, uri_template, uri_template_json,
            clone_dict(css_class), clone_dict(config), context,
        )


class Base(object):

    def __init__(self, definition):
        self.definition = definition

    def format_uri(self, **kw):
        """
        Subclasses should override this, as the default simply take over
        the entire query string with the path.
        """

        return expand(self.definition.uri_template, **kw)

    def finalize(self, obj):
        config = clone_dict(self.definition.config)
        config.update(obj.get('nunja_model_config', {}))

        # XXX This is a big huge crutch for now to get an independent
        # end point.  Must make decision on how to address this, either
        # keep and refactor out to external method, or figure out the
        # proper ontological term to represent this within the system.
        if 'data_href' in obj.get('result', {}):
            config['data_href'] = obj['result']['data_href']

        meta = obj.get('meta', {})
        css_class = clone_dict(self.definition.css_class)
        css_class.update(meta.get('css_class', {}))
        meta['css_class'] = css_class

        obj['meta'] = meta
        obj['nunja_model_config'] = config
        obj['nunja_model_id'] = self.definition.nunja_model_id
        obj['@context'] = obj.get('@context', self.definition.context)
        return obj
