#!/usr/bin/env python
from os import getcwd
from os.path import basename
from os import environ

import json

from nunja.core import engine
from nunja.stock.model import fsnavtree

nav = fsnavtree.Base(
    getcwd(),
    basename(__file__) + '?{path}',
    uri_template_json=basename(__file__) + '?{path}',
)

target = environ.get('QUERY_STRING') or '/'

# XXX this does NOT work in PY3 due to
# - http://bugs.python.org/issue5053
# - http://bugs.python.org/issue5054

if environ.get('HTTP_ACCEPT') == 'application/json':
    print("Content-Type: application/json")
    print("")
    print(json.dumps(nav.get_struct(target)))
else:
    print("Content-Type: text/html")
    print("")

    body = engine.execute(
        'nunja.stock.molds/navtree', data=nav.get_struct(target))
    html = engine.render('nunja.molds/html5', data={
        'title': 'Example page',
        'js': [
            '/node_modules/requirejs/require.js',
            '/nunja.js',
            '/nunja/config.js',
            'init.js'
        ],
        'body': body,
    })

    print(html)
