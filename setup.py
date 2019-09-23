from setuptools import setup, find_packages

version = '0.0'

classifiers = """
Development Status :: 4 - Beta
Intended Audience :: Developers
License :: OSI Approved :: GNU General Public License v2 or later (GPLv2+)
Operating System :: OS Independent
Programming Language :: JavaScript
Programming Language :: Python :: 3.4
Programming Language :: Python :: 3.5
Programming Language :: Python :: 3.6
Programming Language :: Python :: 3.7
""".strip().splitlines()

package_json = {
    "dependencies": {
        "webpack": "~4.16.0",
        "webpack-cli": "~3.0.0",
    },
    "devDependencies": {
        "eslint": "~3.15.0",
    },
}

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
    classifiers=classifiers,
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
    package_json=package_json,
    install_requires=[
        'nunja'
        ' @ git+https://github.com/calmjs/nunja.git@master',
        'uritemplate'
        ' @ git+https://github.com/python-hyper/uritemplate.git@df03b63b7',
    ],
    extras_require={
        'dev': [
            'calmjs.dev>=1.0.2,<3',
            'calmjs.parse>=1.0.0,<2',
        ],
        'rjs': [
             'calmjs.rjs',
        ],
        'webpack': [
             'calmjs.webpack',
        ],
    },
    python_requires='>=3.4',
    build_calmjs_artifacts=True,
    entry_points={
        'calmjs.module': [
            'nunja.stock = nunja.stock',
        ],
        'calmjs.module.tests': [
            'nunja.stock.tests = nunja.stock.tests',
        ],
        'nunja.mold': [
            'nunja.stock.molds = nunja.stock:molds',
        ],
        'calmjs.artifacts': [
            'nunja.stock.rjs.js = calmjs.rjs.artifact:complete_rjs',
            'nunja.stock.webpack.js'
            ' = calmjs.webpack.artifact:complete_webpack',
        ],
        'calmjs.artifacts.tests': [
            'nunja.stock.rjs.js = calmjs.rjs.artifact:test_complete_rjs',
            'nunja.stock.webpack.js'
            ' = calmjs.webpack.artifact:test_complete_webpack',
        ],
        'calmjs.toolchain.advice.apply': [
            'nunja = nunja',
        ],
    },
    test_suite="nunja.stock.tests.make_suite",
)
