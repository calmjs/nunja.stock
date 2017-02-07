Examples
========

The following are very experimental examples that can be used with the
``nunja.serve.simple.rjs`` module in conjunction of the patch that fixes
the handling of ``Accept`` headers so that ``HTTP_ACCEPT`` is properly
populated (which ``nunja.serve`` provides).  To use, simply copy the
contents of this directory elsewhere and execute the following in that
directory with the environment where ``nunja.stock`` is installed as a
Python module activated.

.. code:: sh

    $ calmjs npm --install -P nunja.stock
    $ calmjs rjs nunja
    $ python -m nunja.serve.simple.rjs


Installing Prerequisites
------------------------

For the sake of convenience, given the alpha state of this particular
project, the following commands may simply be executed directly in this
directory.  Assuming Git and Node.js is already installed, this may be
executed first to clone this repository for this directory, and
instantiate the python virtual environment directly there:

.. code:: sh

    $ git clone https://github.com/calmjs/nunja.stock.git
    $ cd nunja.stock/examples
    $ virtualenv env
    $ . env/bin/activate

As there may be bugs in the version of ``setuptools`` that is copied
into the virtual environment from the system provided version (2.2 is
notoriously broken), ensure the latest version of that is installed:

.. code:: sh

    (env) $ pip install -U setuptools

Ensure that the ``calmjs`` package is installed first before triggering
the installation of the various packages through the ``setup.py`` method
via the included ``requirements.txt`` file like so.  Reason being is
that ``calmjs`` is required for the generation of ``package.json`` for
the Python packages, which is needed for the ``npm`` dependencies.  If
this was note done, the second command will need to be executed again
as that will correctly create the necessary metadata files.

.. code:: sh

    (env) $ pip install calmjs
    (env) $ pip install -r requirements.txt

Now use ``calmjs npm`` to install the Node.js dependencies required for
this (``nunja.stock``) package.  It should install ``requirejs``,
``requirejs-text`` and ``nunjucks`` and their dependencies:

.. code:: sh

    (env) $ calmjs npm --install -P nunja.stock

Lastly, generate the necessary artifact required for the client-side
rendering to function, as ``calmjs.rjs`` by default does not support the
hot-reloading of client-side code for infrastructure libraries, (which
``nunja`` does support as that is for flexible client-side libraries).
Build this artifact in a way that only include the infrastructure
library so that the templates and scripts in development packages can be
manipulated to see that the hot-reloading works while developing client-
side libraries.

.. code:: sh

    (env) $ calmjs rjs nunja --source-registry=calmjs.module

There may be warnings from the ``slimit`` module due the package having
pregenerated modules that may not match its dependencies that are
installed (they can be removed so they can be correctly regenerated).

Now that the ``nunja.js`` is written, try serving that via:

.. code:: sh

    (env) $ python -m nunja.serve.simple.rjs

It should bind directly to 127.0.0.1 for security reasons.  Open a
browser window to http://127.0.0.1:8000/ and select the ``fsnavtree.py``
link from the standard directory listing to bring up a similar view that
include client-side update code for the demonstration (though currently
without the ability to view any files as that needs implementation).
Naturally, any code changes to the molds will be reflected immediately,
while the changes to the core ``nunja`` clients will need to be rebuilt
using ``calmjs rjs``.

A completely static (but without the pre-compiled nunjucks templates)
artifact for ``nunja.stock`` can be produced simply by:

.. code:: sh

    (env) $ calmjs rjs nunja.stock

Or alternatively with templates pre-compiled in:

.. code:: sh

    (env) $ calmjs rjs nunja.stock --optional-advice=nunja

The output file should be ``nunja.stock.js`` by default.  Refer to the
built-in help for details.
