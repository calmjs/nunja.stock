'use strict';

window.mocha.setup('bdd');


describe('nunja.stock.molds/navgrid/filter tests', function() {

    var filter = require('nunja.stock.molds/navgrid/filter');

    var fake_populate = function(obj) {
        return obj;
    };

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
