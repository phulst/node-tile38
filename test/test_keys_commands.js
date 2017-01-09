"use strict"
const Tile38 = require('../src/tile38');
require('chai').should();


var assert = require('assert');
describe('key commands', function() {
    let tile38;

    beforeEach(function(done) {
        tile38 = new Tile38({debug: true});

        tile38.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
            tile38.set('fleet', 'truck2', [33.5011, -112.2710]).then(() => {
                done();
            });
        });
    });

    describe('bounds', function() {
        it("should return bounds for a key", (done) => {
            tile38.bounds('fleet').then((bounds) => {
                bounds.sw.lat.should.exist;
                bounds.sw.lon.should.exist;
                bounds.ne.lat.should.exist;
                bounds.ne.lon.should.exist;
                done();
            })
        });
    });

    describe('expiration', function() {
        let randExpiration = Math.floor(Math.random() * 100) + 10;

        it("should set expiration on an id", (done) => {
            tile38.expire('fleet', 'truck2', randExpiration).then((res) => {
                // this will always return ok, even if the key/id doesn't exist
                res.should.be.true;
                // read back the TTL, which will already be lower than the value we set
                tile38.ttl('fleet', 'truck2').then((res) => {
                    res.should.be.above(randExpiration - 2);
                    done();
                });
            });
        });

        it("should persist object", (done) => {
            // first, expire it
            tile38.expire('fleet', 'truck2', 20).then((res) => {
                tile38.persist('fleet', 'truck2').then((r) => {
                    r.should.be.true;
                    done();
                })
            });
        });
    });

    describe('keys', function() {
        it("should return all keys matching 'fleet:*' pattern", (done) => {
            tile38.keys('fl??t').then((keys) => {
                keys.length.should.equal(1);
                keys[0].should.equal('fleet');
                done();
            });
        });
    });

    describe('get', function() {
        it("should fetch with default type", (done) => {
            tile38.get('fleet', 'truck1').then((res) => {
                res.object.type.should.equal('Point');
                done();
            });
        });

        it("should fetch with geojson type", (done) => {
            tile38.get('fleet', 'truck1', 'OBJECT').then((res) => {
                res.object.type.should.equal('Point');
                done();
            });
        });

        it("should fetch as point", (done) => {
            tile38.get('fleet', 'truck1', 'POINT').then((res) => {
                res.point.lat.should.equal(33.5123);
                res.point.lon.should.equal(-112.2693);
                done();
            });
        });

        it("should fetch as bounds", (done) => {
            tile38.get('fleet', 'truck1', 'BOUNDS').then((res) => {
                res.bounds.sw.should.exist;
                res.bounds.ne.should.exist;
                done();
            });
        });

        it("should fetch as hash", (done) => {
            tile38.get('fleet', 'truck1', 'HASH', 6).then((res) => {
                res.hash.should.exist;
                res.hash.length.should.equal(6);
                done();
            });
        })
    });

    describe('del', function() {
        it("should delete the id", (done) => {
            tile38.del('fleet', 'truck1').then((res) => {
                res.should.be.true;
                // it should now no longer exist
                tile38.get('fleet', 'truck1').then((thing) => {
                    throw error('this shouldn\'t happen');
                    console.log(thing);
                }).catch((err) => {
                    // since the key should no longer exist, we expect an error here
                    err.should.equal('id not found');
                    done();
                });
            })
        });
    });

    describe('fields', function() {
        it("should set a field on an id", (done) => {
            tile38.fset('fleet', 'truck2', 'value', 20).then((res) => {
                res.should.be.true;
                // fetch it back to verify the field is set
                tile38.get('fleet', 'truck2').then((res) => {
                    res.fields.value.should.equal(20);
                    done();
                });
            })
        });
    });

    describe('set', function() {
        it("should set object with simple coordinates", (done) => {
            tile38.set('fleet', 'truck1', [33.5123, -112.2693]).then((res) => {
                res.should.be.true;
                done();
            });
        });
        it("should set object with simple coordinates plus altitude", (done) => {
            tile38.set('fleet', 'truck1', [33.5123, -112.2693, 230]).then((res) => {
                res.should.be.true;
                done();
            });
        });
        it("should set object with bounds", (done) => {
            tile38.set('fleet', 'area', [33.7840, -112.1520, 33.7848, -112.1512]).then((res) => {
                res.should.be.true;
                done();
            });
        });
        it("should set object with geohash", (done) => {
            tile38.set('props', 'area1', '9tbnwg').then((res) => {
                res.should.be.true;
                done();
            });
        });
        it("should set object with string", (done) => {
            tile38.set('fleet', 'somewhere', 'my string value', {}, {'type':'string'}).then((res) => {
                res.should.be.true;
                done();
            });
        });
    });
});
