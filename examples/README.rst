Examples
========

The following are very experimental examples that can be used with the
``nunja.serve.simple.rjs`` module in conjunction of the patch that fixes
the handling of ``Accept`` headers so that ``HTTP_ACCEPT`` is properly
populated.  To use, simply copy the contents of this directory elsewhere
and execute the following in that directory with the environment where
``nunja.stock`` is installed as a Python module activated.

.. code:: sh

    $ calmjs npm --install -P nunja.stock
    $ calmjs rjs nunja
    $ python -m nunja.serve.simple.rjs
