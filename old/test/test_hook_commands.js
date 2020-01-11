"use strict";
const Tile38 = require('../src/tile38');
require('chai').should();
const expect = require('chai').expect;
// var assert = require('assert');

describe('hook commands', function() {
    let tile38;

    beforeEach(function(done) {
        tile38 = new Tile38({debug: false});
        done();
        // tile38.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
        //     tile38.set('fleet', 'truck2', [33.5011, -112.2710]).then(() => {
        //         done();
        //     });
        // });
    });

    describe('sethook', function() {
        it("should do a nearby search with point", done => {
            let meta = { field: 'val1', field2: 'val2'};
            let opts = {
                point:      [33.637276, -84.434006],
                radius:     500
            };
            tile38.setHook('testhook0', 'http://httpbin.org/post', meta, 'nearby', 'fleet', opts).then(res => {
                res.should.be.true;
                done();
            });
        });
    });

    describe('sethook', function() {
        it("should do a nearby search with point", done => {
            let meta = { field: 'val1', field2: 'val2'};
            let opts = {
            	roam: ['fleet', '*', 500]
            };
            tile38.setHook('testhook1', 'http://httpbin.org/post', meta, 'nearby', 'fleet', opts).then(res => {
                res.should.be.true;
                done();
            });
        });
    });

    describe('list hooks', function() {
        it("should return all hooks", done => {
            tile38.hooks('*').then(res => {
                expect(res.length).to.be.above(0);
                done();
            });
        });
        it("should return all testhook", done => {
            tile38.hooks('testhook*').then(res => {
                expect(res.length).to.equal(2);
                expect(res[0].name).to.equal('testhook0');
                expect(res[1].name).to.equal('testhook1');
                done();
            });
        });
    });


});
