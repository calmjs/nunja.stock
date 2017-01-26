# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

import os
import stat
from os.path import basename
from os.path import exists
from os.path import join
from os.path import sep

from posixpath import normpath


statmap = (
    (stat.S_ISDIR, 'folder'),
    (stat.S_ISCHR, 'chardev'),
    (stat.S_ISBLK, 'blockdev'),
    (stat.S_ISREG, 'file'),
    (stat.S_ISFIFO, 'fifo'),
    (stat.S_ISLNK, 'symlink'),
    (stat.S_ISSOCK, 'socket'),
)

columns = ['type', 'name', 'size', 'created']


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

class Base(object):

    def __init__(self, root, href_pattern, active_columns=None):
        """
        Arguments:

        root
            The root directory; all entries will be generated from below
            this one.
        href_pattern
            This stores the implementation specific pattern that will be
            applied to the final href that will be rendered for elements
            that links to an actual object through the view that
            implements the function.  The base implementation simply
            treat this as the absolute path to the raw script name; see
            the method ``path_to_client_href`` for details.
        active_columns
            The columns that are active.
        """

        self.root = root
        self.href_pattern = href_pattern
        if not active_columns:
            self.active_columns = columns
        else:
            # the specified columns have an order priority
            self.active_columns = [c for c in active_columns if c in columns]

    def path_to_client_href(self, path):
        """
        Subclasses should override this, as the default simply take over
        the entire query string with the path.
        """

        return self.href_pattern + '?' + path

    def _fs_path_to_client_href(self, fs_path):
        return self.href_pattern + '?' + '/'.join(
            fs_path[len(self.root):].split(sep))

    def _get_attrs(self, fs_path):
        attr = os.stat(fs_path)
        base = {
            '@id': basename(fs_path),
            'href': self._fs_path_to_client_href(fs_path),
        }
        f_type = to_filetype(attr.st_mode)
        result = {k: v for k, v in (
            ('type', f_type),
            ('name', basename(fs_path)),
            ('size', 0 if f_type == 'folder' else attr.st_size),
            ('created', attr.st_ctime),
        ) if k in self.active_columns}
        result.update(base)
        return result

    def _get_struct_dir(self, fs_path):
        items = [
            self._get_attrs(join(fs_path, n)) for n in os.listdir(fs_path)]
        result = self._get_struct_file(fs_path)
        result['result']['items'] = items

        # other metadata
        result['active_columns'] = self.active_columns
        result['column_map'] = {
            k: k for k in columns if k in self.active_columns}
        return result

    def _get_struct_file(self, fs_path):
        result = self._get_attrs(fs_path)
        return {'result': result}

    def finalize(self, result):
        result['cls'] = result.get('cls', {})
        return result

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
        Turn a path into a filesystem path.
        """

        if not path or path[0] != '/':
            raise ValueError("path must start with '/'")

        subpath = normpath(path)
        fs_path = join(self.root, subpath[1:])
        return fs_path
