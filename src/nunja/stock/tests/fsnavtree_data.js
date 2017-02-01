var exports = {
    '/': {
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
            "@id": "/",
            "href": "/script.py?/",
            "items": [
                {
                    "@id": "dir",
                    "href": "/script.py?/dir",
                    "data_href": "/script.py?/dir",
                    "name": "dir",
                    "size": 0,
                    "type": "folder"
                },
                {
                    "@id": "file1",
                    "href": "/script.py?/file1",
                    "name": "file1",
                    "size": 13,
                    "type": "file"
                },
                {
                    "@id": "file2",
                    "href": "/script.py?/file2",
                    "name": "file2",
                    "size": 13,
                    "type": "file"
                }
            ],
            "name": "dummydir2",
            "size": 0,
            "type": "folder"
        }
    },
    '/dir': {
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
            "@id": "dir",
            "href": "/script.py?/dir",
            "data_href": "/script.py?/dir",
            "items": [
                {
                    "@id": "nested",
                    "href": "/script.py?/dir/nested",
                    "data_href": "/script.py?/dir/nested",
                    "name": "nested",
                    "size": 0,
                    "type": "folder"
                },
                {
                    "@id": "file1",
                    "href": "/script.py?/dir/file1",
                    "name": "file1",
                    "size": 13,
                    "type": "file"
                },
                {
                    "@id": "file2",
                    "href": "/script.py?/dir/file2",
                    "name": "file2",
                    "size": 13,
                    "type": "file"
                }
            ],
            "name": "dir",
            "size": 0,
            "type": "folder"
        }
    },
};

// requirejs export shim
define([], function() {
    return exports;
});
