"use strict";
const expect = require('chai').expect;

const Geofence = require('../src/geofence');

describe('geofence', function() {
    let geofence;


    describe('constructor', function() {
        it("should throw error if no options are passed in", function(done) {
            try {
                new Geofence();
            } catch (err) {
                expect(err.message).to.match(/requires an options object/);
                done();
            }
        })
    });


    describe('detect', function() {
        it("should parse DETECT option correctly when passed as array", function(done) {
            let opts = { detect: ['inside', 'outside'] };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('DETECT');
            expect(cmd[1]).to.equal('inside,outside');
            done();
        });
        it("should parse DETECT option correctly when passed as csv", function(done) {
            let opts = { detect: 'inside,enter' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('DETECT');
            expect(cmd[1]).to.equal('inside,enter');
            done();
        });
        it("should parse DETECT option correctly when passed as single value", function(done) {
            let opts = { detect: 'cross' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('DETECT');
            expect(cmd[1]).to.equal('cross');
            done();
        });
    });

    describe('commands', function() {
        it("should parse COMMANDS option correctly when passed as array", function(done) {
            let opts = { commands: ['set','del'] };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('COMMANDS');
            expect(cmd[1]).to.equal('set,del');
            done();
        });
        it("should parse COMMANDS option correctly when passed as csv", function(done) {
            let opts = { commands: 'del,drop' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('COMMANDS');
            expect(cmd[1]).to.equal('del,drop');
            done();
        });
        it("should parse COMMANDS option correctly when passed as single value", function(done) {
            let opts = { commands: 'del' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd[0]).to.equal('COMMANDS');
            expect(cmd[1]).to.equal('del');
            done();
        });
    });

    describe('output', function() {
        it("should set the COUNTS output", function(done) {
            let opts = { output: 'counts' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('COUNTS');
            done();
        });
        it("should set the IDS output", function(done) {
            let opts = { output: 'ids' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('IDS');
            done();
        });
        it("should set the OBJECTS output", function(done) {
            let opts = { output: 'objects' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('OBJECTS');
            done();
        });
        it("should set the POINTS output", function(done) {
            let opts = { output: 'points' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('POINTS');
            done();
        });
        it("should set the BOUNDS output", function(done) {
            let opts = { output: 'bounds' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('BOUNDS');
            done();
        });
        it("should set the HASHES output", function(done) {
            let opts = { output: 'hashes 10' };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(1);
            expect(cmd[0]).to.equal('HASHES 10');
            done();
        });
    });

    describe('area formats', function() {
        it("should set the GET format", function (done) {
            let opts = {getObject: ['someObject', 'someKey']};
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(3);
            expect(cmd[0]).to.equal('GET');
            expect(cmd[1]).to.equal('someObject');
            expect(cmd[2]).to.equal('someKey');
            done();
        });
        it("should set the BOUNDS format", function (done) {
            let b = [33.462, -112.268, 33.491, -112.245];
            let opts = {bounds: b};
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(5);
            expect(cmd[0]).to.equal('BOUNDS');
            expect(cmd[1]).to.equal(b[0]);
            expect(cmd[2]).to.equal(b[1]);
            expect(cmd[3]).to.equal(b[2]);
            expect(cmd[4]).to.equal(b[3]);
            done();
        });
        it("should set the OBJECT format", function (done) {
            let polygon = {"type":"Polygon","coordinates":
                [[[-111.9787,33.4411],[-111.8902,33.4377],[-111.8950,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]};
            let opts = {object: polygon};
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(2);
            expect(cmd[0]).to.equal('OBJECT');
            let exp = '{"type":"Polygon","coordinates":[[[-111.9787,33.4411],[-111.8902,33.4377],[-111.895,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]}';
            expect(cmd[1]).to.equal(exp);
            done();
        });
        it("should set the TILE format", function (done) {
            let tile = [ 10.0, 10.1, 10.2];
            let geofence = new Geofence({ tile });
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(4);
            expect(cmd[0]).to.equal('TILE');
            expect(cmd[1]).to.equal(tile[0]);
            expect(cmd[2]).to.equal(tile[1]);
            expect(cmd[3]).to.equal(tile[2]);
            done();
        });
        it("should set the QUADKEY format", function (done) {
            let geofence = new Geofence({ quadkey: '32112321' });
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(2);
            expect(cmd[0]).to.equal('QUADKEY');
            expect(cmd[1]).to.equal(cmd[1]);
            done();
        });
        it("should set the HASH format", function (done) {
            let geofence = new Geofence({ hash: 'ab42e6' });
            let cmd = geofence.commands();
            expect(cmd.length).to.equal(2);
            expect(cmd[0]).to.equal('HASH');
            expect(cmd[1]).to.equal('ab42e6');
            done();
        });
    });
});

    // beforeEach(function(done) {
    //     tile38 = new Tile38({debug: true, port: 9850});
    //     done();
    //     // tile38.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
    //     //     tile38.set('fleet', 'truck2', [33.5011, -112.2710]).then(() => {
    //     //         done();
    //     //     });
    //     // });
    // });

