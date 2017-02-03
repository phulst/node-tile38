"use strict";
const Tile38 = require('../src/tile38');
require('chai').should();
const expect = require('chai').expect;
// var assert = require('assert');

describe('search commands', function() {
    let tile38;

    beforeEach(function(done) {
        tile38 = new Tile38({debug: false, port: 9850});
        done();
    });

    describe('intersects', function() {
        it("should construct an intersects query", done => {
            let q = tile38.intersectsQuery('fleet');
            q.cursor(50).limit(10).match('fleet*').where('a', 0, 20).detect('inside')
                .output('objects').bounds(33.462, -112.268, 33.491, -112.245);
            let exp = 'INTERSECTS fleet CURSOR 50 LIMIT 10 MATCH fleet* WHERE a 0 20 DETECT inside OBJECTS BOUNDS 33.462 -112.268 33.491 -112.245'
            expect(q.commandStr()).to.equal(exp);
            done();
        });
    });

    describe('nearby', function() {
        it("should construct an nearby query", done => {
            let q = tile38.nearbyQuery('fleet');
            q.distance().nofields().commands('del','drop').point(33.462, -112.268, 6000);
            let exp = 'NEARBY fleet DISTANCE NOFIELDS COMMANDS del,drop POINT 33.462 -112.268 6000';
            expect(q.commandStr()).to.equal(exp);
            done();
        });
        it("should successfully execute a nearby query", done => {
            let q = tile38.nearbyQuery('fleet').nofields().commands('del','drop').point(33.462, -112.268, 6000);
            q.execute().then(res => {
                expect(res.objects).to.not.be.null;
                expect(res.count).to.be.a('number');
                done();
            })
        });
    });

    describe('scan', function() {
        it("should construct an scan query", done => {
            let q = tile38.scanQuery('fleet').match('id*').order('asc').output('points');
            let exp = 'SCAN fleet MATCH id* ASC POINTS';
            expect(q.commandStr()).to.equal(exp);
            done();
        });
        it("should successfully execute a scan query", done => {
            let q = tile38.scanQuery('fleet').asc();
            q.execute().then(res => {
                expect(res.objects).to.not.be.null;
                expect(res.count).to.be.a('number');
                done();
            })
        });
    });

    describe('search', function() {
        it("should construct an search query", done => {
            let q = tile38.searchQuery('fleet').desc().nofields().output('ids');
            let exp = 'SEARCH fleet DESC NOFIELDS IDS';
            expect(q.commandStr()).to.equal(exp);
            done();
        });
    });

    describe('within', function() {
        it("should construct an within query", done => {
            let q = tile38.withinQuery('fleet').bounds(33.462, -112.268, 33.491, -112.245);
            let exp = 'WITHIN fleet BOUNDS 33.462 -112.268 33.491 -112.245';
            expect(q.commandStr()).to.equal(exp);
            done();
        });
    });
});
