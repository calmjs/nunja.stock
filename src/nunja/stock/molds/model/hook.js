define([], function() {
    'use strict';

    var amd_call_map = function(obj, module_attr_args_list, results) {
        /*
        Helper method to map a definition to load and call modules.

        This effectively maps a module attribute argument list to the
        import/call routine.  The structure of the list is a 3-tuple
        of AMD module name, attribute name and list of arguments.  The
        module name will be imported, the attribute will be extracted
        from that module and it will be invoked (via apply) with the
        provided object, optionally push the results into the provided
        results Array.

        Arguments:

        obj
            The object to apply with.

        module_attr_args_list
            The list of tuples, a tuple in that list might look like
            this:

            ["some/ns/module", "callable", ["arg1", "arg2"]]

        results
            If it is an array, its push method will be called to push
            the results returned into there.
        */
        return module_attr_args_list.map(function(entry) {
            (function(module_name, callable, args) {
                require([module_name], function(module) {
                    // the called function will have a reference to
                    // the object provided.
                    var result = module[callable].apply(obj, args);
                    if (results instanceof Array) {
                        results.push(result);
                    }
                });
            }).apply(null, entry);
        });
    };

    var custom_populate = function(definition_list) {
        /*
        Hook a module definition listing to the populate handler for a
        given model.

        This will call amd_call_map on the provided list and apply the
        results asynchronously to the populate handler.  The caller
        should bind the model to `this` so that the results can be
        directly applied to the object.
        */

        // Specify custom handlers to disable the default rendering,
        // as it is possible for the async loader to be slow.
        // TODO figure out what happens if the handlers are broken?
        this.populate_handlers = [];
        amd_call_map(null, definition_list, this.populate_handlers);
    };

    return {
        'amd_call_map': amd_call_map,
        'custom_populate': custom_populate,
    };
});
