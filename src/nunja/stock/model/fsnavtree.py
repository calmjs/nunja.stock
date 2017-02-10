# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

import json
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

    def __init__(
            self, root, uri_template,
            uri_template_json=None,
            active_columns=None,
            config=None,
            ):
        """
        Arguments:

        root
            The root directory; all entries will be generated from below
            this one.
        uri_template
            This is the template for all the URIs that will be generated
            for all the navigational links.  It should follow the
            convention set forth by RFC 6570.

            see the method ``format_uri`` for details.
        uri_template_json
            This is the template for all the URIs that will be generated
            for all the navigational links for getting to the JSON for
            that particular record.

            Defaults to uri_template if left as unassigned.
        active_columns
            The columns that are active.
        config
            Optional configuration mapping.
        """

        self.root = root
        self.uri_template = uri_template
        self.uri_template_json = uri_template_json
        if not active_columns:
            self.active_columns = columns
        else:
            # the specified columns have an order priority
            self.active_columns = [c for c in active_columns if c in columns]

        self.config = {}
        if isinstance(config, dict):
            self.config.update(config)

    def format_uri(self, path, template=None):
        """
        Subclasses should override this, as the default simply take over
        the entire query string with the path.
        """

        if template is None:
            template = self.uri_template
        return template.format(path=path)

    def _fs_format_uri(self, fs_path, template=None):
        return self.format_uri('/'.join(
            fs_path[len(self.root):].split(sep)), template)

    def _get_attrs(self, fs_path):
        attr = os.stat(fs_path)
        f_type = to_filetype(attr.st_mode)

        base = {
            '@id': basename(fs_path),
            '@type': f_type,
            'href': self._fs_format_uri(fs_path),
        }

        if self.uri_template_json:
            if f_type == 'folder':
                # only hook this up for folders.
                base['data_href'] = self._fs_format_uri(
                    fs_path, self.uri_template_json)

        result = {k: v for k, v in (
            ('type', f_type),
            ('name', basename(fs_path)),
            ('size', 0 if f_type == 'folder' else attr.st_size),
            ('created', attr.st_ctime),
        ) if k in self.active_columns}
        result.update(base)
        return result

    def _get_struct_dir(self, fs_path):
        items = sorted(
            [self._get_attrs(join(fs_path, n)) for n in os.listdir(fs_path)],
            key=lambda x: (x['@type'] != 'folder', x['@id']),
        )
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

    def finalize(self, obj):
        config = {}
        config.update(self.config)
        config.update(obj.get('navtree_config', {}))

        if 'data_href' in obj.get('result', {}):
            config['data_href'] = obj['result']['data_href']

        obj['cls'] = obj.get('cls', {})
        obj['navtree_config'] = json.dumps(config)
        return obj

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
