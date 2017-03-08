#!/usr/bin/env python
from os import getcwd
from os.path import basename
from os import environ

import json

from nunja.core import engine
from nunja.stock.model import fsnav

nav = fsnav.Base(
    'baseid',
    getcwd(),
    basename(__file__) + '?{path}',
    uri_template_json=basename(__file__) + '?{path}',
    anchor_key='name',
    css_class={
        'table': 'pure-table',
    },
)

target = environ.get('QUERY_STRING') or '/'

body_tmpl = """
<div id="layout">
    <div id="main">
        <div class="content">
        <h1>Directory Listing</h1>
        %s
        </div>
    </div>
</div>
"""

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

    body = body_tmpl % engine.execute(
        'nunja.stock.molds/model', data=nav.get_struct(target))
    html = engine.render('nunja.molds/html5', data={
        'title': 'Example page',
        'js': [
            '/node_modules/requirejs/require.js',
            '/nunja.stock.js',
            '/nunja/config.js',
            'init.js'
        ],
        'css': [
            '/pure-min.css',
            '/local.css',
        ],
        'body': body,
    })

    print(html)
