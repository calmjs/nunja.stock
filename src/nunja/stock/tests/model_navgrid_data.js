/* eslint max-len: "off" */

var exports = {
    '/': {
        "@context": "http://schema.org",
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/script.py?/",
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "mainEntity": {
            "@id": "/",
            "url": "/script.py?/",
            "data_href": "/script.py?/",
            "name": "/",
            "size": 0,
            "@type": "ItemList",
            "additionalType": "folder",
            "itemListElement": [
                {
                    "@id": "dir",
                    "url": "/script.py?/dir/",
                    "data_href": "/script.py?/dir/",
                    "name": "dir",
                    "size": 0,
                    "additionalType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "bad_target",
                    "url": "/script.py?/bad_target",
                    "data_href": "/script.py?/bad_target",
                    "name": "bad_target",
                    "size": 0,
                    "type": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file1",
                    "url": "/script.py?/file1",
                    "name": "file1",
                    "size": 13,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file2",
                    "url": "/script.py?/file2",
                    "name": "file2",
                    "size": 13,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                }
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "additionalType": "type"
            },
            "active_keys": [
                "name",
                "additionalType",
                "size"
            ]
        }
    },

    '/dir/': {
        "@context": "http://schema.org",
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/script.py?/dir/",
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "mainEntity": {
            "@id": "dir",
            "url": "/script.py?/dir/",
            "name": "dir",
            "size": 0,
            "additionalType": "folder",
            "@type": "ItemList",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "data_href": "/script.py?/",
                    "name": "..",
                    "size": 0,
                    "additionalType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "nested",
                    "url": "/script.py?/dir/nested/",
                    "data_href": "/script.py?/dir/nested/",
                    "name": "nested",
                    "size": 0,
                    "additionalType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "bad_target",
                    "url": "/dir/bad_target",
                    "data_href": "/dir/bad_target",
                    "name": "bad_target",
                    "size": 0,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file1",
                    "url": "/script.py?/dir/file1",
                    "name": "file1",
                    "size": 13,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                },
                {
                    "@id": "file2",
                    "url": "/script.py?/dir/file2",
                    "name": "file2",
                    "size": 13,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                }
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "additionalType": "type"
            },
            "active_keys": [
                "name",
                "additionalType",
                "size"
            ]
        }
    },

    '/dir/nested/': {
        "@context": "http://schema.org",
        "nunja_model_id": "model_grid",
        "nunja_model_config": {
            "data_href": "/script.py?/dir/nested/",
            "mold_id": "nunja.stock.molds/navgrid"
        },
        "mainEntity": {
            "@id": "dir",
            "url": "/script.py?/dir/nested/",
            "name": "dir",
            "size": 0,
            "additionalType": "folder",
            "@type": "ItemList",
            "itemListElement": [
                {
                    "@id": "..",
                    "url": "/script.py?/",
                    "data_href": "/script.py?/",
                    "name": "..",
                    "size": 0,
                    "additionalType": "folder",
                    "@type": "ItemList"
                },
                {
                    "@id": "deep",
                    "url": "/script.py?/dir/nested/deep",
                    "name": "deep",
                    "size": 33,
                    "additionalType": "file",
                    "@type": "CreativeWork"
                },
            ],
            "key_label_map": {
                "name": "name",
                "size": "size",
                "additionalType": "type"
            },
            "active_keys": [
                "name",
                "additionalType",
                "size"
            ]
        }
    },

};

// requirejs export shim
define([], function() {
    return exports;
});
