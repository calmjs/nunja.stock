// the lines cannot be broken due to strict requirement that the content
// must also be parsed as JSON from within Python.
/* eslint max-len: "off" */

var exports = {
    "model rendering null":
    [{
        "nunja_model_id": "model",
        "nunja_model_config": {},
    }, [
        "<div data-nunja=\"nunja.stock.molds/model\">",
        "<div id=\"model\" data-config=\"{}\">",
        "</div>",
        "</div>"
    ]],

    "model to grid rendering":
    [{
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/script/somewhere",
            "mold_id": "nunja.stock.molds/grid"
        },
        "mainEntity" : {
            "colnames": [],
            "rownames": ["Jan", "Feb", "Mar", "Apr", "May"],
            "rows": [["31"], ["28"], ["31"], ["30"], ["31"]],
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/model\">",
        "<div id=\"model_grid\" data-config=\"{&quot;data_href&quot;:&quot;/script/somewhere&quot;,&quot;mold_id&quot;:&quot;nunja.stock.molds/grid&quot;}\">",
        "<table class=\"\">",
        "  <thead>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <th>Jan</th>",
        "      <td>31</td>",
        "    </tr>",
        "    <tr class=\"\">",
        "      <th>Feb</th>",
        "      <td>28</td>",
        "    </tr>",
        "    <tr class=\"\">",
        "      <th>Mar</th>",
        "      <td>31</td>",
        "    </tr>",
        "    <tr class=\"\">",
        "      <th>Apr</th>",
        "      <td>30</td>",
        "    </tr>",
        "    <tr class=\"\">",
        "      <th>May</th>",
        "      <td>31</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>",
        "</div>"
    ]],

    "model to grid rendering with css_class":
    [{
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/script/somewhere",
            "mold_id": "nunja.stock.molds/grid"
        },
        "mainEntity" : {
            "colnames": [],
            "rownames": ["Jan"],
            "rows": [["31"]]
        },
        "meta": {
            "css_class": {
                "table": "table"
            }
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/model\">",
        "<div id=\"model_grid\" data-config=\"{&quot;data_href&quot;:&quot;/script/somewhere&quot;,&quot;mold_id&quot;:&quot;nunja.stock.molds/grid&quot;}\">",
        "<table class=\"table\">",
        "  <thead>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"\">",
        "      <th>Jan</th>",
        "      <td>31</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>",
        "</div>"
    ]],

    "model to navgrid rendering with css_class":
    [{
        "@context": "https://schema.org/",
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/json.py?/dummydir2/",
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "mainEntity": {
            "@id": "dummydir2",
            "@type": "ItemList",
            "href": "/script.py?/dummydir2/",
            "data_href": "/json.py?/dummydir2/",
            "name": "dummydir2",
            "size": 0,
            "alternativeType": "folder",
            "itemListElement": [
                {
                    "@id": "..",
                    "href": "/script.py?/",
                    "data_href": "/json.py?/",
                    "name": "..",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "dir",
                    "href": "/script.py?/dummydir2/dir/",
                    "data_href": "/json.py?/dummydir2/dir/",
                    "name": "dir",
                    "size": 0,
                    "alternativeType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "file1",
                    "href": "/script.py?/dummydir2/file1",
                    "name": "file1",
                    "size": 13,
                    "alternativeType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file2",
                    "href": "/script.py?/dummydir2/file2",
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
            "css_class": {
                "table": "table",
                "table.thead.tr": "header",
                "table.tbody.tr": "table.row"
            },
        }
    }, [
        "<div data-nunja=\"nunja.stock.molds/model\">",
        "<div id=\"model_grid\" data-config=\"{&quot;data_href&quot;:&quot;/json.py?/dummydir2/&quot;,&quot;mold_id&quot;:&quot;nunja.stock.molds/navgrid&quot;}\">",
        "<table class=\"table\">",
        "  <thead>",
        "    <tr class=\"header\">",
        "    <td>name</td><td>type</td><td>size</td>",
        "    </tr>",
        "  </thead>",
        "  <tbody>",
        "    <tr class=\"table.row\">",
        "      <td><a href=\"/script.py?/\" data-href=\"/json.py?/\">..</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"table.row\">",
        "      <td><a href=\"/script.py?/dummydir2/dir/\" data-href=\"/json.py?/dummydir2/dir/\">dir</a></td><td>folder</td><td>0</td>",
        "    </tr><tr class=\"table.row\">",
        "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
        "    </tr><tr class=\"table.row\">",
        "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
        "    </tr>",
        "  </tbody>",
        "</table>",
        "</div>",
        "</div>"
    ]],

};

// requirejs export shim
define([], function() {
    return exports;
});
