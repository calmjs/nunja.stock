# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

from itertools import chain

from nunja.stock.model import base

try:
    from urllib.parse import urlparse
except ImportError:  # pragma: no cover
    from urlparse import urlparse


class FragmentBC(base.Base):
    """
    A basic implementation that assumes all inputs are fragments.
    """

    def __init__(self, definition, home='Home', start_position=1):
        super(FragmentBC, self).__init__(definition)
        self.home = home
        self.start_position = start_position

    def format_href(self, fragments):
        return self.definition.format_href(path=fragments)

    def make_item(self, fragments, position, fragment):
        final = (
            [] if fragments != [''] and position == len(fragments) else [''])
        return {
            "@id": self.format_href(fragments[1:position] + final),
            "name": (self.home if (
                position == self.start_position and
                fragment in ('', '/')
            ) else fragment.strip('/')),
        }

    def make_breadcrumb(self, fragments):
        """
        Simply split the path.
        """

        chained_fragments = list(fragments if fragments == [''] else chain(
            [''], fragments))

        return {"mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": position,
                    "item": self.make_item(
                        chained_fragments, position, fragment),
                }
                for position, fragment in enumerate(
                    chained_fragments, self.start_position)
            ]
        }}

    def get_breadcrumb(self, fragments):
        return self.finalize(self.make_breadcrumb(fragments))


class PathBC(FragmentBC):
    """
    A implementation of breadcrumbs that deals with raw paths.

    Assumes the site root where parsed uri path == '/'
    """

    def format_href(self, fragments):
        return self.definition.format_href(path='/'.join([''] + fragments))

    def make_breadcrumb_from_uri(self, uri):
        """
        Simply split the path.
        """

        # XXX maintain the one by uri???
        # XXX make it from path fragments.

        # TODO verify that the provided uri conforms to the uri_pattern
        # defined for this object?

        path = urlparse(uri).path
        if path[:1] != '/':
            # account for a relative uri, since some are provided as so.
            path = '/' + path
        fragments = path.split('/')[1:]
        return self.make_breadcrumb(fragments)

    def get_breadcrumb_from_uri(self, uri):
        return self.finalize(self.make_breadcrumb_from_uri(uri))
