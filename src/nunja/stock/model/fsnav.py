# -*- coding: utf-8 -*-
"""
Model for filesystem navtree
"""

import os
import stat
from os.path import basename
from os.path import dirname
from os.path import exists
from os.path import join
from os.path import isdir
from os.path import normpath
from os.path import sep

from posixpath import normpath as normuri
from posixpath import dirname as diruri
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


class FSModel(object):
    """
    Simple base model for representing the navigation of some filesystem
    like structure.
    """

    def __init__(self, root):
        """
        Constructor for the filesystem view

        root
            The path for the root of this model.  All entries will be
            generated below this one.
        """

        # TODO deal with symlinks that point outside the root?
        self.root = root

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

    def _fs_path_format_path(self, fs_path):
        trail = [''] if isdir(fs_path) else []
        return '/'.join(normpath(fs_path)[len(self.root):].split(sep) + trail)

    def _listdir(self, fs_path):
        """
        Will only list fs_path that also start with the root of this
        instance.
        """

        # XXX safety checking only applies here; should this apply to
        # get_attrs also?
        # alternatively, address as path instead of fs_path?
        root = normpath(self.path_to_fs_path('/'))
        n_path = normpath(fs_path)
        if not n_path.startswith(root):
            return

        if n_path != root:
            yield '..'

        for i in os.listdir(n_path):
            yield i

    def _list_attrs(self, fs_path):
        attr = os.stat(fs_path)
        f_type = to_filetype(attr.st_mode)
        ld_type = 'ItemList' if f_type == 'folder' else 'CreativeWork'

        return [
            ('@id', basename(fs_path)),
            ('@type', ld_type),
            ('path', self._fs_path_format_path(fs_path)),
            ('alternativeType', f_type),
            ('name', basename(fs_path)),
            ('size', 0 if f_type == 'folder' else attr.st_size),
            ('created', attr.st_ctime),
        ]

    def get_attrs(self, fs_path, filter_f=dict):
        """
        Default implementation will simply call self._list_attrs on the
        path and cast that into a dict and return
        """

        return filter_f(self._list_attrs(fs_path))

    def listdir(self, fs_path, filter_f=dict):
        """
        List a directory at path but also pass through the results per
        entry through the filter_f function.
        """

        for name in self._listdir(fs_path):
            value = self.get_attrs(join(fs_path, name), filter_f)
            if value:
                yield value

    def get_struct(self, fs_path, filter_main=dict, filter_items=None):
        """
        Retrieve the fs_path as a structure and pass it through the
        provided filter_main function; if this is not provided, the
        default get_attr of this instance will be used.

        If the provided fs_path is a directory, the itemListElement will
        be assigned with the listing of all the valid elements, again
        passed through the same filter_main that is provided.

        Naturally, there will be cases where the filter to the main
        object is not the same as the filter for the items; in this case
        a further argument can be provided for this
        """

        if filter_items is None:
            filter_items = filter_main

        result = {'mainEntity': self.get_attrs(fs_path, filter_main)}
        if isdir(fs_path):
            result['mainEntity']['itemListElement'] = sorted(
                (item for item in self.listdir(fs_path, filter_items)),
                key=lambda x: (x['alternativeType'] != 'folder', x['@id']),
            )
        return result


class Base(base.Base):

    def __init__(
            self, definition, root,
            impl=FSModel,
            active_keys=None,
            anchor_key=None,
            type_definitions=None,
            ):
        """
        Arguments:

        definition
            The core (default) definitions for a nunja model

        root
            The root directory; all entries will be generated from below
            this one.

        active_keys
            The keys that are active.

        anchor_key
            The column to render the anchor.

        type_definitions
            Type specific definitions - allow specific definitions to
            be used for the finalizing part.
        """

        super(Base, self).__init__(definition)
        self.fs_model = impl(root)
        if not active_keys:
            self.active_keys = fsnav_keys
        else:
            # the specified keys have an order priority
            self.active_keys = [c for c in active_keys if c in fsnav_keys]

        # TODO restrict it to available active_keys
        self.anchor_key = anchor_key
        self.type_definitions = type_definitions if type_definitions else {}

    def create_filter(self, condition=lambda x: True):

        def f_filter(f_list_attrs):
            result = dict(f_list_attrs)
            if not condition(result):
                return None
            path = result.pop('path')

            # remove all inactive keys
            for key in set(fsnav_keys) - set(self.active_keys):
                result.pop(key, None)

            result['url'] = self.definition.format_href(path=path)
            if self.definition.uri_template_json:
                result['data_href'] = self.definition.format_data_href(
                    path=path)
            return result

        return f_filter

    def _get_struct_dir(self, fs_path, condition):
        result = self.fs_model.get_struct(
            fs_path, self.create_filter(), self.create_filter(condition))

        # other metadata
        result['mainEntity']['active_keys'] = self.active_keys
        if self.anchor_key:
            result['mainEntity']['anchor_key'] = self.anchor_key

        result['mainEntity']['key_label_map'] = {
            k: v for k, v in zip(fsnav_keys, fsnav_keys_value)
            if k in self.active_keys
        }
        # XXX MUST be provided by definition, along with id
        result['nunja_model_config'] = {
            'mold_id': 'nunja.stock.molds/navgrid',
        }
        return result

    def _get_struct_file(self, fs_path):
        def pre_filter(attrs):
            rows, rownames = [], []
            part_of = None
            for key, value in attrs:
                if key == 'path':
                    part_of = value
                if key not in self.active_keys:
                    continue
                rownames.append(key)
                rows.append([value])

            if part_of and self.definition.uri_template_json:
                # XXX this should actually follow the same url as the
                # true identifier of the object, i.e. format with the
                # standard format_href; however, this is being used with
                # the fetch_for filter for now to provide a way to
                # ensure the related element will be synchronized when
                # the state changes.
                # However, the more correct way is to not do this but
                # have the history/state API better manage that from the
                # client.
                attrs.append(['partOf', self.definition.format_data_href(
                    path=diruri(part_of))])

            attrs.append(['rows', rows])
            attrs.append(['rownames', rownames])
            return self.create_filter()(attrs)

        result = self.fs_model.get_struct(fs_path, pre_filter)

        # XXX MUST be provided by definition
        result['nunja_model_config'] = {
            'mold_id': 'nunja.stock.molds/grid',
        }
        return result

    def get_struct(self, path, dir_condition=lambda x: True):
        """
        Return a structure from a path that can be used with the mold.
        The provided path will first be converted to a fs_path.
        """

        fs_path = self.fs_model.path_to_fs_path(path)
        if not exists(fs_path):
            return self.finalize({'error': 'path "%s" not found' % path})

        filetype = get_filetype(fs_path)
        # TODO have a finalize that turn all path (the partial path
        # provided by subclass of BaseModel) into url
        # TODO have this FSNav follow that protocol
        # XXX should be a hash - composition
        if filetype == 'folder':
            struct = self._get_struct_dir(fs_path, dir_condition)
        else:
            struct = self._get_struct_file(fs_path)

        definition = self.type_definitions.get(filetype, self.definition)
        return definition.finalize(struct)

    def get_struct_dirs_only(self, path):
        # if the path lead to a file, its parent will  be listed instead
        if not isdir(self.fs_model.path_to_fs_path(path)):
            path = dirname(path)
        return self.get_struct(path, lambda x: x.get('@type') == 'ItemList')

    def get_struct_files_only(self, path):
        return self.get_struct(path, lambda x: x.get('@type') != 'ItemList')
