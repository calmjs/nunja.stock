# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

import re

from .base import Base

try:
    from urllib.parse import urlparse
except ImportError:  # pragma: no cover
    from urlparse import urlparse


class Simple(Base):
    """
    A simple implementation of a model of breadcrumbs.

    Assumes the site root where parsed uri path == '/'
    """

    def __init__(
            self, definition, home='Home', start_position=1,
            pattern=r'([^/]*/?)'
            ):
        super(Simple, self).__init__(definition)
        self.home = home
        self.start_position = start_position
        self.pattern = re.compile(pattern)

    def make_item(self, fragments, position, fragment):
        # XXX very naive implementation that does not take into account
        # of a bunch of edge cases.
        return {
            "@id": self.format_uri(path=''.join(fragments[:position])),
            "name": (
                self.home
                if position == self.start_position and fragment == '/' else
                fragment.strip('/')
            ),
        }

    def make_breadcrumb(self, url):
        """
        Simply split the path.
        """

        # TODO verify that the provided url conforms to the uri_pattern
        # defined for this object?
        fragments = self.pattern.findall(urlparse(url).path)

        return {"mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": position,
                    "item": self.make_item(fragments, position, fragment),
                }
                for position, fragment in enumerate(
                    fragments, self.start_position)
                if fragment
            ]
        }}

    def get_breadcrumb(self, url):
        return self.finalize(self.make_breadcrumb(url))
