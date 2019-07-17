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

empty_pf = ['']  # empty path fragment
empty = []


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
        # apply a similar rule to each item as per make_breadcrumb
        return {
            "@id": self.format_href(fragments),
            "name": (self.home if (
                position == self.start_position and fragment == ''
            ) else fragment.strip('/')),
        }

    def norm_fragments(self, fragments, final=True):
        # essentially treat as path.split all the way down to root, and
        # drop the first empty root element as uritemplate effectively
        # provide that but without encoding it.
        #
        # the effective representations:
        # [] - None
        # [''] - /
        # ['foo'] - /foo
        # ['foo', 'bar'] - /foo/bar
        # ['foo', 'bar', ''] - /foo/bar/
        #
        # So given the case, assume the empty value to be the home root
        # and to avoid a "empty" file name, convert the [''] case to the
        # empty case, and then re-add that via suffix.
        #
        # Also, apply final empty path fragment if fragments provided
        # is not final; use in cases to treat this as a "directory".

        if fragments == empty or fragments == empty_pf:
            return ['', '']
        prefix = empty if fragments[:1] == empty_pf else empty_pf
        suffix = empty if final else empty_pf
        return list(chain(prefix, fragments, suffix))

    def make_breadcrumb(self, fragments):
        """
        Simply split the path.
        """

        norm_fragments = self.norm_fragments(fragments)
        length = len(norm_fragments)

        return {"mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": position,
                    "item": self.make_item(
                        self.norm_fragments(
                            fragments=norm_fragments[:position],
                            final=(position == length))[1:],
                        position, fragment
                    ),
                }
                for position, fragment in enumerate(
                    norm_fragments, self.start_position)
                if fragment or position != len(norm_fragments)
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
