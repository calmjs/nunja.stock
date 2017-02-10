// the lines cannot be broken due to strict requirement that the content
// must also be parsed as JSON from within Python.
/* eslint max-len: "off" */

var exports = [
    [{
        "active_columns": [
            "name",
            "type",
            "size"
        ],
        "cls": {},
        "navtree_config": "{}",
        "column_map": {
            "name": "name",
            "size": "size",
            "type": "type"
        },
        "result": {
            "@id": "dummydir2",
            "href": "/script.py?/dummydir2",
            "items": [
                {
                    "@id": "dir",
                    "href": "/script.py?/dummydir2/dir",
                    "name": "dir",
                    "size": 0,
                    "type": "folder",
                    "@type": "folder"
                },
                {
                    "@id": "file1",
                    "href": "/script.py?/dummydir2/file1",
                    "name": "file1",
                    "size": 13,
                    "type": "file",
                    "@type": "file"
                },
                {
                    "@id": "file2",
                    "href": "/script.py?/dummydir2/file2",
                    "name": "file2",
                    "size": 13,
                    "type": "file",
                    "@type": "file"
                }
            ],
            "name": "dummydir2",
            "size": 0,
            "type": "folder",
            "@type": "folder"
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/navtree\">",
        "<div data-config=\"{}\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/dir\">dir</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>",
        "</div>"
    ]],

    [{
        "active_columns": [
            "name",
            "type",
            "size"
        ],
        "cls": {},
        "navtree_config": "{\"data_href\": \"/json.py?/dummydir2\"}",
        "column_map": {
            "name": "name",
            "size": "size",
            "type": "type"
        },
        "result": {
            "@id": "dummydir2",
            "href": "/script.py?/dummydir2",
            "data_href": "/json.py?/dummydir2",
            "items": [
                {
                    "@id": "dir",
                    "href": "/script.py?/dummydir2/dir",
                    "data_href": "/json.py?/dummydir2/dir",
                    "name": "dir",
                    "size": 0,
                    "type": "folder",
                    "@type": "folder"
                },
                {
                    "@id": "file1",
                    "href": "/script.py?/dummydir2/file1",
                    "name": "file1",
                    "size": 13,
                    "type": "file",
                    "@type": "file"
                },
                {
                    "@id": "file2",
                    "href": "/script.py?/dummydir2/file2",
                    "name": "file2",
                    "size": 13,
                    "type": "file",
                    "@type": "file"
                }
            ],
            "name": "dummydir2",
            "size": 0,
            "type": "folder",
            "@type": "folder"
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/navtree\">",
        "<div data-config=\"{&quot;data_href&quot;: &quot;/json.py?/dummydir2&quot;}\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/dir\" data-href=\"/json.py?/dummydir2/dir\">dir</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>",
        "</div>"
    ]],
];

// requirejs export shim
define([], function() {
    return exports;
});
