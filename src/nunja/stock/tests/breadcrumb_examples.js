// the lines cannot be broken due to strict requirement that the content
// must also be parsed as JSON from within Python.
/* eslint max-len: "off" */

var exports = {
    "null rendering":
    [{
        "@context": "http://schema.org",
        "mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": []
        }
    }, [
        ""
    ]],

    "root item":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {},
        "nunja_model_id": "model_id",
        "mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@id": "https://example.com/",
                    "name": "Home",
                },
            }]
        },
        "meta": {"css_class": {}}
    }, [
        ""
    ]],

    "two items":
    [{
        "@context": "https://schema.org/",
        "nunja_model_config": {},
        "nunja_model_id": "model_id",
        "mainEntity": {
            "@type": "BreadcrumbList",
            "itemListElement": [{
                "@type": "ListItem",
                "position": 1,
                "item": {
                    "@id": "https://example.com/",
                    "name": "Home",
                },
            }, {
                "@type": "ListItem",
                "position": 2,
                "item": {
                    "@id": "https://example.com/documents/",
                    "name": "documents/",
                },
            }, {
                "@type": "ListItem",
                "position": 3,
                "item": {
                    "@id": "https://example.com/documents/item",
                    "name": "item",
                },
            }]
        },
        "meta": {"css_class": {}},
    }, [
        ""
    ]],

};

// requirejs export shim
define([], function() {
    return exports;
});
