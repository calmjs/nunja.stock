# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

import os
import stat
from os.path import basename
from os.path import exists
from os.path import join
from os.path import isdir
from os.path import normpath
from os.path import sep

from posixpath import normpath as normuri
from nunja.stock.model import base


statmap = (
    (stat.S_ISDIR, 'folder'),
    (stat.S_ISCHR, 'chardev'),
    (stat.S_ISBLK, 'blockdev'),
    (stat.S_ISREG, 'file'),
    (stat.S_ISFIFO, 'fifo'),
    (stat.S_ISLNK, 'symlink'),
    (stat.S_ISSOCK, 'socket'),
)

# using alternativeType from schema.org due to JSON-LD aliasing of @type
# to type
fsnav_keys = ['alternativeType', 'name', 'size', 'created']
fsnav_keys_value = ['type', 'name', 'size', 'created']


def to_filetype(mode):
    for f, v in statmap:
        if f(mode):
            return v
    return 'unknown'


def get_filetype(path):
    return to_filetype(os.stat(path).st_mode)


# XXX as it is now, this implementation is extremely specific to
# filesystem rather than some more generic navigation tree.  Works as a
# first cut, but it needs to be better decoupled so that a more generic
# navtree model can be provided.

class Base(base.Base):

    def __init__(
            self, definition, root,
            active_keys=None,
            anchor_key=None,
            ):
        """
        Arguments:

        definition
            The core definitions for a nunja model

        root
            The root directory; all entries will be generated from below
            this one.

        active_keys
            The keys that are active.

        anchor_key
            The column to render the anchor.
        """

        super(Base, self).__init__(definition)
        self.root = root
        if not active_keys:
            self.active_keys = fsnav_keys
        else:
            # the specified keys have an order priority
            self.active_keys = [c for c in active_keys if c in fsnav_keys]

        # TODO restrict it to available active_keys
        self.anchor_key = anchor_key

    def _fs_path_format_path(self, fs_path):
        trail = [''] if isdir(fs_path) else []
        return '/'.join(normpath(fs_path)[len(self.root):].split(sep) + trail)

    def _get_attrs(self, fs_path):
        attr = os.stat(fs_path)
        f_type = to_filetype(attr.st_mode)
        ld_type = 'ItemList' if f_type == 'folder' else 'CreativeWork'

        result = [
            ('@id', basename(fs_path)),
            ('@type', ld_type),
            ('url', self.format_uri(path=self._fs_path_format_path(fs_path))),
        ]

        # TODO maybe have a better way of doing this via parent class
        # i.e. accessing definition shouldn't strictly be necessary.
        if self.definition.uri_template_json:
            result.append(('data_href', self.format_uri_data_href(
                path=self._fs_path_format_path(fs_path))))

        result.extend([(k, v) for k, v in [
            ('alternativeType', f_type),
            ('name', basename(fs_path)),
            ('size', 0 if f_type == 'folder' else attr.st_size),
            ('created', attr.st_ctime),
        ] if k in self.active_keys])
        return result

    def listdir(self, path):
        """
        Will only list path within the root.
        """

        root = normpath(self.path_to_fs_path('/'))
        n_path = normpath(path)
        if not n_path.startswith(root):
            return

        if n_path != root:
            yield '..'

        for i in os.listdir(n_path):
            yield i

    def _get_struct_dir(self, fs_path):
        items = sorted(
            [dict(self._get_attrs(join(fs_path, n))) for n in self.listdir(
                fs_path)],
            key=lambda x: (x['alternativeType'] != 'folder', x['@id']),
        )

        result = {'mainEntity': dict(self._get_attrs(fs_path))}
        result['mainEntity']['itemListElement'] = items

        # other metadata
        result['mainEntity']['active_keys'] = self.active_keys
        if self.anchor_key:
            result['mainEntity']['anchor_key'] = self.anchor_key

        result['mainEntity']['key_label_map'] = {
            k: v for k, v in zip(fsnav_keys, fsnav_keys_value)
            if k in self.active_keys
        }
        result['nunja_model_config'] = {
            'mold_id': 'nunja.stock.molds/navgrid',
        }
        return result

    def _get_struct_file(self, fs_path):
        result = dict(self._get_attrs(fs_path))

        result['rows'], result['rownames'] = [], []
        for key, value in self._get_attrs(fs_path):
            if key not in self.active_keys:
                continue
            result['rownames'].append(key)
            result['rows'].append([value])

        # This result is bad form as it is redundant as we are trying to
        # fit the data into the mold, rather the other way around where
        # a mold is provided for the data.  Must consider it from the
        # perspective of actual webservice consumers.
        return {
            'mainEntity': result,
            'nunja_model_config': {
                'mold_id': 'nunja.stock.molds/grid',
            },
        }

    def get_struct(self, path):
        """
        Return a structure from a path that can be used with the mold.
        The provided path will first be converted to a fs_path.
        """

        fs_path = self.path_to_fs_path(path)
        if not exists(fs_path):
            return self.finalize({'error': 'path "%s" not found' % path})

        filetype = get_filetype(fs_path)
        if filetype == 'folder':
            return self.finalize(self._get_struct_dir(fs_path))
        else:
            return self.finalize(self._get_struct_file(fs_path))

    def path_to_fs_path(self, path):
        """
        Turn a path into a filesystem path.  The filesystem path must be
        fully sanitized.
        """

        if not path or path[0] != '/':
            raise ValueError("path must start with '/'")

        subpath = normuri(path)
        fs_path = join(self.root, subpath[1:])
        return fs_path
