import logging

from os import getcwd
from os.path import basename
from itertools import chain

from sanic import Sanic
from sanic import response

from nunja.core import engine
from nunja.stock.model.base import Definition
from nunja.stock.model import fsnav
from nunja.stock.model import breadcrumb

from nunja.serve.sanic import RJSProvider


logger = logging.getLogger('mtj.gallery.server')
provider = RJSProvider('/nunja/')
app = provider(Sanic())

# the application specifics.

provider_js = list(provider.yield_core_paths())
# TODO once the underlying provider can automatically set this up via
# its auto-detection via development setting flags, remove
static_js = [
    '/node_modules/requirejs/require.js',
    '/nunja.stock.js',
]

static_css = [
    '/pure-min.css',  # via https://purecss.io/
    '/local.css',
]

for t in chain(static_js, static_css):
    # root the path absolute, make the provided path relative
    app.static(t, t[1:])


css_class = {
    'table': 'pure-table',
}

bc = breadcrumb.Simple(Definition(
    'nav_breadcrumb', '/fsnavtree{+path}', css_class={
        'ol': 'breadcrumb',
    },
))

dir_definition = main_definition = Definition(
    'listing',
    '/fsnavtree{+path}',
    # argument to help browser distinguish cache entries
    uri_template_json='/fsnavtree{+path}?',
    css_class=css_class,
    config={'hooks': [
        # ['nunja.stock.molds/breadcrumb/index', 'hook', ['hi']],
        ['nunja.stock.molds/model/hook', 'custom_populate', [[
            ['nunja.stock.molds/navgrid/filter', 'only', [
                {'@type': 'ItemList'},
            ]],
            ['nunja.stock.molds/navgrid/filter', 'redirect', [
                'file', {'@type': 'CreativeWork'},
            ]],
        ]]]
    ]},
)

file_definition = Definition(
    'file',
    '/fsnavtree{+path}',
    # argument to help browser distinguish cache entries
    uri_template_json='/fsnavtree{+path}?',
    css_class=css_class,
    config={'hooks': [
        # ['nunja.stock.mold/breadcrumb/index', 'hook', ['hi']],
        ['nunja.stock.molds/model/hook', 'custom_populate', [[
            ['nunja.stock.molds/navgrid/filter', 'fetch_for', [
                'listing', 'partOf', {'@type': 'ItemList'},
            ]],
            ['nunja.stock.molds/navgrid/filter', 'identity', []],
        ]]]
    ]},
)

dirnav = fsnav.Base(
    file_definition,
    getcwd(),
    anchor_key='name',
    type_definitions={
        'folder': dir_definition,
    }
)

# need this one as this will use the file_definition for rendering, and
# will not switch to the folder version for the initial render. 
# i.e. this is for server side only. 
filenav = fsnav.Base(
    file_definition,
    getcwd(),
    anchor_key='name',
)

# Supposed this can be done using a jinja template...
body_tmpl = """
<div id="layout">
    <div id="main">
        <div class="content">
        <h1>Directory Listing</h1>
        %(breadcrumb)s
        %(dir)s
        %(file)s
        </div>
    </div>
</div>
"""


@app.route('/fsnavtree/')
@app.route('/fsnavtree/<path:path>')
async def fsnavtree_demo(request, path=''):
    if 'application/json' in request.headers.get('accept'):
        return response.json(dirnav.get_struct(path))

    body = body_tmpl % {
        'breadcrumb': engine.execute(
            'nunja.stock.molds/breadcrumb', data=bc.get_breadcrumb(path)),
        'dir': engine.execute(
            'nunja.stock.molds/model',
            data=dirnav.get_struct_dirs_only(path)),
        'file': engine.execute(
            'nunja.stock.molds/model',
            data=filenav.get_struct_files_only(path)),
    }
    html = engine.render('nunja.molds/html5', data={
        'title': 'Example page',
        'js': static_js + provider_js,
        'css': static_css,
        'body': body,
    })
    return response.html(html)


if __name__ == "__main__":
    app.run(host="127.0.0.1", port=9000)
