// the lines cannot be broken due to strict requirement that the content
// must also be parsed as JSON from within Python.
/* eslint max-len: "off" */

var exports = {
    "null rendering":
    [{"result": {
        "@context": "http://schema.org",
        "@type": "ItemList",
        "itemListElement": [],
        "key_label_map": {},
        "active_keys": []
    }}, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "  </tbody>",
        "</table>",
        "</div>",
    ]],

    "standard rendering":
    [{"result": {
        "@context": "http://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@id": "..",
                "href": "/script.py?/",
                "name": "..",
                "size": 0,
                "type": "folder",
                "@type": "ItemList"
            },
            {
                "@id": "dir",
                "href": "/script.py?/dummydir2/dir/",
                "name": "dir",
                "size": 0,
                "type": "folder",
                "@type": "ItemList"
            },
            {
                "@id": "file1",
                "href": "/script.py?/dummydir2/file1",
                "name": "file1",
                "size": 13,
                "type": "file",
                "@type": "CreativeWork"
            },
            {
                "@id": "file2",
                "href": "/script.py?/dummydir2/file2",
                "name": "file2",
                "size": 13,
                "type": "file",
                "@type": "CreativeWork"
            }
        ],
        "key_label_map": {
            "name": "name",
            "size": "size",
            "type": "type"
        },
        "active_keys": [
            "name",
            "type",
            "size"
        ],
        "href": "/script.py?/dummydir2/",
        "@id": "dummydir2",
        "name": "dummydir2",
        "size": 0,
        "type": "folder",
    }}, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <td><a href=\"/script.py?/\">..</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/dir/\">dir</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>"
    ]],

    "configured rendering":
    [{"result": {
        "@context": "http://schema.org",
        "@type": "ItemList",
        "itemListElement": [
            {
                "@id": "..",
                "href": "/script.py?/",
                "data_href": "/json.py?/",
                "name": "..",
                "size": 0,
                "type": "folder",
                "@type": "ItemList"
            },
            {
                "@id": "dir",
                "href": "/script.py?/dummydir2/dir/",
                "data_href": "/json.py?/dummydir2/dir/",
                "name": "dir",
                "size": 0,
                "type": "folder",
                "@type": "ItemList"
            },
            {
                "@id": "file1",
                "href": "/script.py?/dummydir2/file1",
                "name": "file1",
                "size": 13,
                "type": "file",
                "@type": "CreativeWork"
            },
            {
                "@id": "file2",
                "href": "/script.py?/dummydir2/file2",
                "name": "file2",
                "size": 13,
                "type": "file",
                "@type": "CreativeWork"
            }
        ],
        "key_label_map": {
            "name": "name",
            "size": "size",
            "type": "type"
        },
        "active_keys": [
            "name",
            "type",
            "size"
        ],
        "href": "/script.py?/dummydir2/",
        "data_href": "/json.py?/dummydir2/",
        "@id": "dummydir2",
        "name": "dummydir2",
        "size": 0,
        "type": "folder",
    }}, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <td><a href=\"/script.py?/\" data-href=\"/json.py?/\">..</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/dir/\" data-href=\"/json.py?/dummydir2/dir/\">dir</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>"
    ]],
};

// requirejs export shim
define([], function() {
    return exports;
});
