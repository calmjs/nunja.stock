'use strict';

window.mocha.setup('bdd');


describe('nunja.stock.molds/navgrid/filter simple tests', function() {

    var filter = require('nunja.stock.molds/navgrid/filter');

    var fake_populate = function(obj) {
        return obj;
    };

    it('identity filter', function() {
        var f = filter.identity();
        var obj = {
            'nunja_model_id': 'something',
            'mainEntity': {
                'itemListElement': [
                    {'id': 1, 'type': 'Thing'},
                    {'id': 2, 'type': 'NotAThing'},
                ]
            }
        };
        var results = f.apply(fake_populate, [obj]);
        // identity
        expect(results).to.equal(obj);
    });

    it('only filter', function() {
        var f = filter.only({'type': 'Thing'});
        var results = f.apply(fake_populate, [
            {'mainEntity': {'itemListElement': [
                {'id': 1, 'type': 'Thing'},
                {'id': 2, 'type': 'NotAThing'},
                {'id': 3, 'type': 'Thing'},
            ]}}
        ]);
        expect(results.mainEntity.itemListElement.length).to.equal(2);
    });

    it('redirect filter', function() {
        var f = filter.redirect('another thing', {'type': 'Thing'});
        var results = f.apply(fake_populate, [{
            'nunja_model_id': 'something',
            'mainEntity': {
                'itemListElement': [
                    {'id': 1, 'type': 'Thing'},
                    {'id': 2, 'type': 'NotAThing'},
                ]
            }
        }]);
        expect(results.nunja_model_id).to.equal('another thing');
        expect(results.mainEntity.itemListElement.length).to.equal(1);
    });

});


describe('nunja.stock.molds/navgrid/filter simple tests', function() {

    var module = require('nunja.stock.molds/model/index');
    var filter = require('nunja.stock.molds/navgrid/filter');

    var create_target_model = function(id) {
        var div = document.createElement('div');
        div.setAttribute('data-nunja', 'nunja.stock.molds/model');
        // emulate the standard rendering.
        var child = document.createElement('div');
        child.setAttribute('id', id);
        // Don't really need to this this for now since the tests stubs
        // out the real methods to maintain isolation.
        // child.setAttribute('data-config', JSON.stringify({
        //     "data_href": '/some/other/data'}));
        div.appendChild(child);
        return new module.Model(div);
    };

    beforeEach(function() {
        this.clock = sinon.useFakeTimers();
        this.server = sinon.fakeServer.create();
        this.server.autoRespond = true;

        this.server.respondWith('GET', '/dummy/data', function (xhr) {
            var s = JSON.stringify({
                'nunja_model_id': 'fetch_for_target_model',
                'mainEntity': {
                    '@type': 'ItemList',
                    'itemListElement': [{
                        '@id': '/item/1',
                        '@type': 'NotAThing',
                    }, {
                        '@id': '/item/2',
                        '@type': 'Thing',
                    }, {
                        '@id': '/item/3',
                        '@type': 'NotAThing',
                    }
                    ],
                },
            });
            xhr.respond(200, {'Content-Type': 'application/json'}, s);
        });
    });

    afterEach(function() {
        this.server.restore();
        this.clock.restore();
    });

    it('fetch_for filter empty', function() {
        var f = filter.fetch_for('fetch_for_target_empty', 'relatedLink');
        var fake_populate = sinon.spy();
        expect(f.apply(fake_populate, [{
            'nunja_model_id': 'something',
            'mainEntity': {},
        }])).to.be.false;
        this.clock.tick(500);
        expect(fake_populate.called).to.be.false;

        expect(f.apply(fake_populate, [{
            'nunja_model_id': 'something',
            'mainEntity': {
                'relatedLink': '/dummy/data',
            }
        }])).to.be.false;
        this.clock.tick(500);
        expect(fake_populate.called).to.be.false;
    });

    it('fetch_for filter have model, no match', function() {
        var f = filter.fetch_for('fetch_for_target_model', 'relatedLink');
        create_target_model('fetch_for_target_model');
        var fake_populate = sinon.spy();
        expect(f.apply(fake_populate, [{
            'nunja_model_id': 'something',
            'mainEntity': {}
        }])).to.be.false;
        this.clock.tick(500);
        expect(fake_populate.called).to.be.false;
    });

    it('fetch_for filter model called, matched', function() {
        var f = filter.fetch_for('fetch_for_target_model', 'relatedLink');
        var target_model = create_target_model('fetch_for_target_model');
        target_model.populate = sinon.spy();

        // can be null as it shouldn't have been called.
        f.apply(null, [{
            'nunja_model_id': 'something',
            'mainEntity': {
                'relatedLink': '/dummy/data'
            }
        }]);
        this.clock.tick(500);
        expect(target_model.populate.called).to.be.true;
    });

    it('fetch_for filter model called with only_filter', function() {
        var f = filter.fetch_for(
            'fetch_for_target_model', 'relatedLink', {'@type': 'Thing'});
        var target_model = create_target_model('fetch_for_target_model');
        var called;
        target_model.populate = function(obj) {
            called = obj;
        };

        // can be null as it shouldn't have been called.
        f.apply(null, [{
            'nunja_model_id': 'something',
            'mainEntity': {
                'relatedLink': '/dummy/data'
            }
        }]);
        this.clock.tick(500);
        expect(called.mainEntity).to.deep.equal({
            'itemListElement': [{
                '@id': '/item/2',
                '@type': 'Thing',
            }],
            '@type': 'ItemList',
        });
    });

});
