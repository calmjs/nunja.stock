var exports = [{
    "active_columns": [
        "name",
        "type",
        "size"
    ],
    "cls": {},
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
                "@id": "file1",
                "href": "/script.py?/dummydir2/file1",
                "name": "file1",
                "size": 13,
                "type": "file"
            },
            {
                "@id": "file2",
                "href": "/script.py?/dummydir2/file2",
                "name": "file2",
                "size": 13,
                "type": "file"
            }
        ],
        "name": "dummydir2",
        "size": 0,
        "type": "folder"
    }
}, [
    "<div data-nunja=\"nunja.stock.molds/navtree\">",
    "<table class=\"\">",
    "  <thead>",
    "    <tr class=\"\">",
    "    <td>name</td><td>type</td><td>size</td>",
    "    </tr>",
    "  </thead>",
    "  <tbody>",
    "    <tr class=\"\">",
    "      <td><a href=\"/script.py?/dummydir2/file1\">file1</a></td><td>file</td><td>13</td>",
    "    </tr><tr class=\"\">",
    "      <td><a href=\"/script.py?/dummydir2/file2\">file2</a></td><td>file</td><td>13</td>",
    "    </tr>",
    "  </tbody>",
    "</table>",
    "</div>"
]]

// requirejs export shim
define([], function() {
    return exports;
})
