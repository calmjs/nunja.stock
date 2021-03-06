// the lines cannot be broken due to strict requirement that the content
// must also be parsed as JSON from within Python.
/* eslint max-len: "off" */

var exports = {
    "null rendering":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {},
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [],
            "key_label_map": {},
            "active_keys": []
        },
        "meta": {
            "css_class": {},
        }
    }, [
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

    "null rendering with css":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {},
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": [],
            "key_label_map": {},
            "active_keys": []
        },
        "meta": {
            "css_class": {
                "table": "testclass",
                "table.thead.tr": "header"
            }
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"testclass\">",
        "  <thead>",
        "    <tr class=\"header\">",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "  </tbody>",
        "</table>",
        "</div>",
    ]],

    "standard dir rendering":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@id": "dummydir2",
            "@type": "ItemList",
            "name": "dummydir2",
            "url": "/script.py?/dummydir2/",
            "size": 0,
            "alternativeType": "folder",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "name": "..",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "dir",
                    "url": "/script.py?/dummydir2/dir/",
                    "name": "dir",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "file1",
                    "url": "/script.py?/dummydir2/file1",
                    "name": "file1",
                    "size": 13,
                    "alternativeType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file2",
                    "url": "/script.py?/dummydir2/file2",
                    "name": "file2",
                    "size": 13,
                    "alternativeType": "file",
                    "@type": "CreativeWork"
                }
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "alternativeType": "type"
            },
            "active_keys": [
                "name",
                "alternativeType",
                "size"
            ]
        },
        "meta": {
            "css_class": {},
        }
    }, [
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

    "configured dir rendering":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {
            "data_href": "/json.py?/dummydir2/",
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@id": "dummydir2",
            "@type": "ItemList",
            "url": "/script.py?/dummydir2/",
            "data_href": "/json.py?/dummydir2/",
            "name": "dummydir2",
            "size": 0,
            "alternativeType": "folder",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "data_href": "/json.py?/",
                    "name": "..",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "dir",
                    "url": "/script.py?/dummydir2/dir/",
                    "data_href": "/json.py?/dummydir2/dir/",
                    "name": "dir",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "file1",
                    "url": "/script.py?/dummydir2/file1",
                    "data_href": "/json.py?/dummydir2/file1",
                    "name": "file1",
                    "size": 13,
                    "alternativeType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file2",
                    "url": "/script.py?/dummydir2/file2",
                    "data_href": "/json.py?/dummydir2/file2",
                    "name": "file2",
                    "size": 13,
                    "alternativeType": "file",
                    "@type": "CreativeWork"
                }
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "alternativeType": "type"
            },
            "active_keys": [
                "name",
                "alternativeType",
                "size"
            ]
        },
        "meta": {
            "css_class": {},
        },
    }, [
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
        "      <td><a href=\"/script.py?/dummydir2/file1\" data-href=\"/json.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\" data-href=\"/json.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>"
    ]],

    "anchor_key":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@id": "dummydir2",
            "@type": "ItemList",
            "name": "dummydir2",
            "url": "/script.py?/dummydir2/",
            "size": 0,
            "alternativeType": "folder",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "data_href": "/json.py?/",
                    "name": "..",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "alternativeType": "type"
            },
            "anchor_key": "size",
            "active_keys": [
                "name",
                "alternativeType",
                "size"
            ]
        },
        "meta": {
            "css_class": {},
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <td>..</td><td>folder</td><td><a href=\"/script.py?/\" data-href=\"/json.py?/\">0</a></td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>"
    ]],

    "empty active_keys":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "nunja_model_id": "fsnav",
        "mainEntity": {
            "@id": "dummydir2",
            "@type": "ItemList",
            "name": "dummydir2",
            "url": "/script.py?/dummydir2/",
            "size": 0,
            "alternativeType": "folder",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "name": "..",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "alternativeType": "type"
            },
            "active_keys": []
        },
        "meta": {
            "css_class": {},
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/navgrid\">",
        "<table class=\"\">",
        "  <thead>",
        "    <tr class=\"\">",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
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
