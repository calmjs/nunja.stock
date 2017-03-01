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
        "result" : {
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
        "result" : {
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

};

// requirejs export shim
define([], function() {
    return exports;
});
