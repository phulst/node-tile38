"use strict";
const expect = require('chai').expect;

const Query = require('../src/tile38_query');

describe('tile38 search query', function() {

    describe('factory methods', function () {
        it("should create INTERSECTS query", function (done) {
            let q = Query.intersects('fleet');
            let cmd = q.commandArr().join(' ');
            expect(cmd).to.equal('INTERSECTS fleet');
            done();
        });
    });

    describe('offset and limit', function() {
        it("should parse offset option", function(done) {
            let q = Query.intersects('fleet').cursor(10);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('CURSOR');
            expect(cmd[3]).to.equal(10);
            done();
        });
        it("should parse limit option", function(done) {
            let q = Query.intersects('fleet').limit(50);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('LIMIT');
            expect(cmd[3]).to.equal(50);
            done();
        });
        it("should parse offset and limit", function(done) {
            let q = Query.intersects('fleet').cursor(100).limit(50);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('CURSOR');
            expect(cmd[3]).to.equal(100);
            expect(cmd[4]).to.equal('LIMIT');
            expect(cmd[5]).to.equal(50);
            done();
        });
    });

    describe('sparse', function() {
        it("should set sparse spread value", function (done) {
            let q = Query.intersects('fleet').sparse(5);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('SPARSE');
            expect(cmd[3]).to.equal(5);
            done();
        });
    });

    describe('match', function() {
        it("should set a match value", function (done) {
            let q = Query.intersects('fleet').match('someid*');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('MATCH');
            expect(cmd[3]).to.equal('someid*');
            done();
        });
        it("should set multiple match values", function (done) {
            let q = Query.intersects('fleet').match('someid*').match('other');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('MATCH');
            expect(cmd[3]).to.equal('someid*');
            expect(cmd[4]).to.equal('MATCH');
            expect(cmd[5]).to.equal('other');
            done();
        });
    });

    describe('where', function() {
        it("should set a where search", function (done) {
            let q = Query.intersects('fleet').where('age', 50, '+inf');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('WHERE');
            expect(cmd[3]).to.equal('age');
            expect(cmd[4]).to.equal(50);
            expect(cmd[5]).to.equal('+inf');
            done();
        });
        it("should set multiple where searches", function (done) {
            let q = Query.intersects('fleet').where('age', 60, '+inf').where('speed', 20);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('WHERE');
            expect(cmd[3]).to.equal('age');
            expect(cmd[4]).to.equal(60);
            expect(cmd[5]).to.equal('+inf');
            expect(cmd[6]).to.equal('WHERE');
            expect(cmd[7]).to.equal('speed');
            expect(cmd[8]).to.equal(20);
            done();
        });
    });

    describe('nofields', function() {
        it("should set nofields property", function (done) {
            let q = Query.intersects('fleet').nofields();
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('NOFIELDS');
            done();
        });
    });

    describe('detect', function() {
        it("should set single detect value", function (done) {
            let q = Query.intersects('fleet').detect('inside');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('DETECT');
            expect(cmd[3]).to.equal('inside');
            done();
        });
        it("should set multiple detect values from a single parameter", function (done) {
            let q = Query.intersects('fleet').detect('inside,outside');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('DETECT');
            expect(cmd[3]).to.equal('inside,outside');
            done();
        });
        it("should set multiple detect values from multiple parameters", function (done) {
            let q = Query.intersects('fleet').detect('inside','outside');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('DETECT');
            expect(cmd[3]).to.equal('inside,outside');
            done();
        });
    });
    describe('commands', function() {
        it("should set single command", function (done) {
            let q = Query.intersects('fleet').commands('del');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('COMMANDS');
            expect(cmd[3]).to.equal('del');
            done();
        });
        it("should set multiple detect values from a single parameter", function (done) {
            let q = Query.intersects('fleet').commands('del,drop');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('COMMANDS');
            expect(cmd[3]).to.equal('del,drop');
            done();
        });
        it("should set multiple detect values from multiple parameters", function (done) {
            let q = Query.intersects('fleet').commands('del','set');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('COMMANDS');
            expect(cmd[3]).to.equal('del,set');
            done();
        });

    });
    describe('output', function() {
        it("should set COUNT output format", function (done) {
            let q = Query.intersects('fleet').output('count');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('COUNT');
            done();
        });
        it("should set POINTS output format", function (done) {
            let q = Query.intersects('fleet').output('points');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('POINTS');
            done();
        });
        it("should set HASHES output format, with precision", function (done) {
            let q = Query.intersects('fleet').output('hashes', 8);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('HASHES 8');
            done();
        });
    });
    describe('get', function() {
        it("should store get query", function (done) {
            let q = Query.intersects('fleet').getObject('cities', 'oakland');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('GET');
            expect(cmd[3]).to.equal('cities');
            expect(cmd[4]).to.equal('oakland');
            done();
        });
    });
    describe('bounds', function() {
        it("should store bounds query", function (done) {
            let q = Query.intersects('fleet').bounds(33.462, -112.268, 33.491, -112.245);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('BOUNDS');
            expect(cmd[3]).to.equal(33.462);
            expect(cmd[4]).to.equal(-112.268);
            expect(cmd[5]).to.equal(33.491);
            expect(cmd[6]).to.equal(-112.245);
            done();
        });
    });
    describe('geojson', function() {
        it("should store geojson query", function (done) {
            let polygon = {"type":"Polygon","coordinates":
                [[[-111.9787,33.4411],[-111.8902,33.4377],[-111.8950,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]};
            let exp = '{"type":"Polygon","coordinates":[[[-111.9787,33.4411],[-111.8902,33.4377],[-111.895,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]}';

            let q = Query.intersects('fleet').object(polygon);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('OBJECT');
            expect(cmd[3]).to.equal(exp);
            done();
        });
    });
    describe('tile', function() {
        it("should store tile query", function (done) {
            let q = Query.intersects('fleet').tile(10,20,30);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('TILE');
            expect(cmd[3]).to.equal(10);
            expect(cmd[4]).to.equal(20);
            expect(cmd[5]).to.equal(30);
            done();
        });
    });
    describe('quadkey', function() {
        it("should store quadkey query", function (done) {
            let q = Query.intersects('fleet').quadKey(3242421);
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('QUADKEY');
            expect(cmd[3]).to.equal(3242421);
            done();
        });
    });
    describe('hash', function() {
        it("should store hash query", function (done) {
            let q = Query.intersects('fleet').hash('382ad23e');
            let cmd = q.commandArr();
            expect(cmd[2]).to.equal('HASH');
            expect(cmd[3]).to.equal('382ad23e');
            done();
        });
    });

});
