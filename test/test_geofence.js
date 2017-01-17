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
        it("should parse DETECT option correctly", function(done) {
            let opts = { detect: ['inside', 'outside'] };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            console.log(cmd.join(' '));
            expect(cmd[0]).to.equal('DETECT');
            expect(cmd[1]).to.equal('inside,outside');
            done();
        });
    });

    describe('commands', function() {
        it("should parse COMMANDS option correctly", function(done) {
            let opts = { commands: ['set'] };
            let geofence = new Geofence(opts);
            let cmd = geofence.commands();
            console.log(cmd.join(' '));
            expect(cmd[0]).to.equal('COMMANDS');
            expect(cmd[1]).to.equal('set');
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

