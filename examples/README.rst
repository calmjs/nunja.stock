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
    $ calmjs rjs nunja.stock
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
hot-reloading of client-side code for infrastructure libraries, which
the ``nunja`` templating system is structured to support that for
flexible and ease of development of client-side libraries.  However, in
order to enable the hot-reloading it requires that the artifact be built
to only include the infrastructure level code, which can be done like
so:

.. code:: sh

    (env) $ calmjs rjs nunja.stock --source-registry=calmjs.module

There may be warnings from the ``slimit`` module due the package having
pregenerated modules that may not match its dependencies that are
installed (they can be removed so they can be correctly regenerated).

If the command was executed much like the simple introductory method,
i.e. omitting the ``--source-registry`` flag, all the templates will
be sourced from the artifact file and thus not as useful.

Simple CGI version (all supported Python versions)
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

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

Sanic version (Python 3.5+)
~~~~~~~~~~~~~~~~~~~~~~~~~~~

An example for using the `Sanic`_ integration layer as it is currently
implemented (as of ``nunja.serve@686499c6e``) is also included in this
directory.  In order to use this, the current environment must be using
Python 3.5+, and simply install it like so:

.. code:: sh

    (env) $ pip install sanic

Once that is done, execute the sample script directly:

.. code:: sh

    (env) $ python sanic_example.py 
    2017-04-04 00:00:00,000: INFO: Goin' Fast @ http://127.0.0.1:9000
    2017-04-04 00:00:00,001: INFO: Starting worker [13337]

Now point the browser to http://127.0.0.1:9000/fsnavtree/ and the site
should come up.  Navigate around and responses should be much faster
than the CGI version.
