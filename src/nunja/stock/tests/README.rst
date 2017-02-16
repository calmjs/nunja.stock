Naming scheme
=============

The files in this directory has specific naming schemes so that they can
be clearly mapped to a specific usage.

``test_*.js``
    Standard JavaScript tests.

``test_*.py``
    Standard Python tests.  Other ``*.py`` files are just standard
    support modules for the execution of Python tests.

``*_examples.js``
    A JavaScript module that exports a single mapping, with its syntax
    written in a way that conforms fully to the JSON syntax, meaning
    long lines will be used as this module can be parsed in Python for
    its JSON fragment.  The keys are a descriptive string and the values
    are simply 2-tuple of the data object to be passed into the nunja
    renderer for a target mold, and the expected results.

    The loader libraries for each of the two langauges will be able to
    execute each of these as if they are individual tests.

``*_data.js``
    Standalone data modules for the JavaScript tests.

All Other ``*.js`` and ``*.py`` files are just standard support modules
for the execution of JavaScript and Python tests, respectively.
