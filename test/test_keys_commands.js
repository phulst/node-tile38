"use strict"
const Tile38 = require('../src/tile38');
require('chai').should();
const expect = require('chai').expect;


var assert = require('assert');
describe('key commands', function() {
    let tile38;

    beforeEach(function(done) {
        tile38 = new Tile38({debug: false});

        tile38.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
            tile38.set('fleet', 'truck2', [33.5011, -112.2710]).then(() => {
                done();
            });
        });
    });

    describe('bounds', function() {
        it("should return bounds for a key", (done) => {
            tile38.bounds('fleet').then((bounds) => {
                bounds.type.should.equal('Polygon');
                bounds.coordinates.should.be.an('array');
                done();
            })
        });
    });

    describe('hooks', function() {
        it("should return an array when calling hooks", (done) => {
            tile38.hooks().then((hooks) => {
                hooks.should.be.an('array');
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

        it("should drop all elements for a key", (done) => {
            tile38.set('somekey', 'truck1', [33.5123, -112.2693]).then(() => {
                tile38.set('somekey', 'truck2', [34.5011, -113.2710]).then(() => {
                    tile38.drop('somekey').then((res) => {
                        tile38.scanQuery('somekey').execute().then((obj) => {
                            obj.objects.length.should.equal(0);
                            done();
                        })
                    });
                });
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
            tile38.get('fleet', 'truck1', {type: 'OBJECT'}).then((res) => {
                res.object.type.should.equal('Point');
                done();
            });
        });

        it("should fetch as point", (done) => {
            tile38.get('fleet', 'truck1', {type: 'POINT'}).then((res) => {
                res.point.lat.should.equal(33.5123);
                res.point.lon.should.equal(-112.2693);
                done();
            });
        });

        it("should fetch as point using getPoint method", (done) => {
            tile38.getPoint('fleet', 'truck1').then((res) => {
                res.point.lat.should.equal(33.5123);
                res.point.lon.should.equal(-112.2693);
                done();
            });
        });

        it("should fetch as bounds", (done) => {
            tile38.get('fleet', 'truck1', {type: 'BOUNDS'}).then((res) => {
                res.bounds.sw.should.exist;
                res.bounds.ne.should.exist;
                done();
            });
        });
        it("should fetch as bounds using getBounds method", (done) => {
            tile38.getBounds('fleet', 'truck1').then((res) => {
                res.bounds.sw.should.exist;
                res.bounds.ne.should.exist;
                done();
            });
        });

        it("should fetch as hash", (done) => {
            tile38.get('fleet', 'truck1', {type: 'HASH 6'}).then((res) => {
                res.hash.should.exist;
                res.hash.length.should.equal(6);
                done();
            });
        })
        it("missing precision should throw an error", (done) => {
            try {
                tile38.get('fleet', 'truck1', {type: 'HASH'}).then((res) => {
                });
            } catch (err) {
                expect(err.message).to.equal('missing precision. Please set like this: "HASH 6"');
                done();
            }
        })
        it("should fetch as hash using getHash method", (done) => {
            tile38.getHash('fleet', 'truck1', {precision: 8}).then((res) => {
                res.hash.should.exist;
                res.hash.length.should.equal(8);
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
                    err.message.should.equal('id not found');
                    done();
                });
            })
        });
    });

    describe('fields', function() {
        it("should not return fields by default", (done) => {
            tile38.fset('fleet', 'truck2', 'value', 20).then((res) => {
                res.should.be.true;
                // fetch it back to verify that we do not receive this field
                tile38.get('fleet', 'truck2').then((res) => {
                    expect(res.fields).to.be.undefined;
                    done();
                });
            })
        });
        it("should set a field on an id", (done) => {
            tile38.fset('fleet', 'truck2', 'value', 30).then((res) => {
                res.should.be.true;
                // fetch it back to verify the field is set
                tile38.get('fleet', 'truck2', {withfields: true}).then((res) => {
                    res.fields.value.should.equal(30);
                    done();
                });
            });
        });
        it("should alllow multiple fields to be set", (done) => {
            tile38.fset('fleet', 'truck2', {name1: 88, name2: 99}).then((res) => {
                res.should.be.true;
                // fetch it back to verify the field is set
                tile38.get('fleet', 'truck2', {withfields: true}).then((res) => {
                    res.fields.name1.should.equal(88);
                    res.fields.name2.should.equal(99);
                    done();
                });
            });
        });
    });

    describe('rename', function() {
        it("should succesfully rename a collection", (done) => {
            tile38.set('oldname', 'truck', [33.5123, -112.2693]).then((res) => {
                res.should.be.true;
                tile38.rename('oldname', 'newname').then((res) => {
                    res.should.be.true;
                    done();
                });
            });
        });
        it("should succesfully rename a collection using renamenx", (done) => {
            tile38.renamenx('newname', 'anothername').then((res) => {
                res.should.be.true;
                done();
            });
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
            let hashVal = '9tbnwg';
            tile38.set('props', 'area1', hashVal).then((res) => {
                res.should.be.true;
                tile38.getHash('props', 'area1').then((res) => {
                    res.hash.should.equal(hashVal);
                    done();
                });
            });
        });
        it("should set object with string", (done) => {
            let strVal = 'my string value';
            tile38.set('fleet', 'somewhere', strVal, {}, {'type':'string'}).then((res) => {
                res.should.be.true;
                tile38.get('fleet', 'somewhere').then((res) => {
                    res.object.should.equal(strVal);
                    done();
                });
            });
        });
        it("should set object with setString", (done) => {
            let strVal = 'my string value';
            tile38.setString('fleet', 'somestring', strVal, {}).then((res) => {
                res.should.be.true;
                tile38.get('fleet', 'somestring').then((res) => {
                    res.object.should.equal(strVal);
                    done();
                });
            });
        });
    });

    describe('json set/get', function() {
        // set a json value
        beforeEach(function(done) {
            tile38.jset('user', '100', 'attr.name', 'peter').then((res) => {
                tile38.jset('user', '100', 'attr.age', 10).then((res) => {
                    done();
                });
            });
        });

        it("should get the entire json", (done) => {
            tile38.jget('user', '100').then((res) => {
                let obj = JSON.parse(res);
                expect(obj.attr.age).to.equal(10);
                expect(obj.attr.name).to.equal('peter');
                done();
            });
        });

        it("should get a specific json property", (done) => {
            tile38.jget('user', '100', 'attr.name').then((res) => {
                expect(res).to.equal('peter');
                done();
            });
        });

        it("should delete a json property", (done) => {
            tile38.jdel('user', '100', 'attr.age').then((res) => {
                res.should.be.true;
                // now, we should only have the name property left
                tile38.jget('user', '100').then((res) => {
                    let obj = JSON.parse(res);
                    expect(obj.attr.name).to.equal('peter');
                    done();
                });
            });
        });
    });

    /* this test is still failing due to the Tile38 not responding within the timeout period.
     * I did fix as suggested here: https://github.com/tidwall/tile38/issues/627
     * 
    describe('whereeval', function() {
      // this tests a fix for issue #28
      it("should execute nearby query using whereeval", (done) => {
        // set area first
        tile38.set('area', '9621a40b0f90f467', [13.3252703267768, 52.5029839702301], {areaId: 12345}).then((res) => {
          // now execute nearby query using a script

          tile38.nearbyQuery('area').distance().point(13.3252703267768, 52.5029839702301, 3500)
            .limit(1).whereEval("return FIELDS.areaId ~= ARGV[1]", 1, 111631).execute((res) => {
                console.dir(res);
                done();
            }).catch((err) => {
                console.dir(err);
                done(err);
            });
        });
      });
    });
    */
});
