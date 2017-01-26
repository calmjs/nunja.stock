from setuptools import setup, find_packages

version = '1.0'

long_description = (
    open('README.rst').read()
    + '\n' +
    open('CHANGES.rst').read()
    + '\n')

setup(
    name='nunja.stock',
    version=version,
    description="Stock molds for nunja",
    long_description=long_description,
    # Get more strings from
    # http://pypi.python.org/pypi?%3Aaction=list_classifiers
    classifiers=[
        "Programming Language :: Python",
    ],
    keywords='',
    author='Tommy Yu',
    author_email='tommy.yu@auckland.ac.nz',
    url='https://github.com/calmjs/nunja.stock',
    license='gpl',
    packages=find_packages('src'),
    package_dir={'': 'src'},
    namespace_packages=['nunja'],
    include_package_data=True,
    zip_safe=False,
    install_requires=[
        'nunja',
    ],
    python_requires='>=2.7,!=3.0.*,!=3.1.*,!=3.2.*',
    entry_points={
        'calmjs.module.tests': [
            'nunja.stock = nunja.stock.tests',
        ],
        'nunja.mold': [
            'nunja.stock.molds = nunja.stock:molds',
        ],
    },
    test_suite="nunja.stock.tests.make_suite",
)
