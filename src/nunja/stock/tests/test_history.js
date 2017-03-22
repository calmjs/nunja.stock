'use strict';

var nunja_stock_history = require('nunja/stock/history');

window.mocha.setup('bdd');


/* istanbul ignore next */
var describe_ = nunja_stock_history.has_push_state ? describe : describe.skip;

/* istanbul ignore next */
if (describe_ === describe.skip) {
    console.log('skipping history related tests due to lack of history API');
}


describe('nunja/stock/history test cases disabled', function() {

    beforeEach(function() {
        this.has_push_state = nunja_stock_history.has_push_state;
    });

    afterEach(function() {
        nunja_stock_history.has_push_state = this.has_push_state;
    });

    it('test history disabled', function() {
        nunja_stock_history.has_push_state = false;
        expect(nunja_stock_history.initialize()).to.be.false;
        expect(nunja_stock_history.push('id', 'href')).to.be.false;
        expect(nunja_stock_history.replace('id', 'href')).to.be.false;
    });

});


describe_('nunja/stock/history test cases enabled', function() {

    afterEach(function() {
        window.history.replaceState(null, window.title);
    });

    it('test history initialize', function() {
        expect(nunja_stock_history.initialize()).to.be.true;
        expect(window.history.state instanceof Object).to.be.true;
    });

    it('test history initialize with arguments', function() {
        expect(nunja_stock_history.initialize('id', 'href')).to.be.true;
        expect(window.history.state).to.deep.equal({
            'id': {'data_href': 'href'}
        });

        expect(nunja_stock_history.initialize('id', 'another')).to.be.true;
        // remain unchanged
        expect(window.history.state).to.deep.equal({
            'id': {'data_href': 'href'}
        });

        expect(nunja_stock_history.initialize('alt', 'new')).to.be.true;
        // the new one should be applied.
        expect(window.history.state).to.deep.equal({
            'id': {'data_href': 'href'},
            'alt': {'data_href': 'new'}
        });

    });

    it('test history replace', function() {
        nunja_stock_history.initialize();
        nunja_stock_history.replace('history_id', 'some_href');
        expect(window.history.state['history_id'].data_href).to.equal(
            'some_href');
        nunja_stock_history.replace('history_id', 'some_href');
        // should not change at all.
        expect(window.history.state['history_id'].data_href).to.equal(
            'some_href');
    });

    it('test history push', function() {
        var pathname = window.location.pathname;
        nunja_stock_history.initialize();
        nunja_stock_history.replace('history_id', 'some_href');
        nunja_stock_history.push('history_id', '/example/test/data');
        expect(window.history.state['history_id'].data_href).to.equal(
            '/example/test/data');
        // should remain unchanged.
        expect(window.location.pathname).to.equal(pathname);
    });

    it('test history push location', function() {
        nunja_stock_history.initialize();
        nunja_stock_history.replace('history_id', 'some_href');
        nunja_stock_history.push(
            'history_id', '/example/test/href', '/example/test/location');
        expect(window.history.state['history_id'].data_href).to.equal(
            '/example/test/href');
        expect(window.location.pathname).to.equal('/example/test/location');
    });

    it('test history get', function() {
        expect(nunja_stock_history.get('obj_id')).to.be.undefined;
        nunja_stock_history.initialize();
        expect(nunja_stock_history.get('obj_id')).to.be.undefined;
        nunja_stock_history.replace('obj_id', 'some_href');
        expect(nunja_stock_history.get('obj_id')).to.equal('some_href');
        nunja_stock_history.replace('model_id', 'model_href');
        expect(nunja_stock_history.get('obj_id')).to.equal('some_href');
        expect(nunja_stock_history.get('model_id')).to.equal('model_href');
    });

});
