"use strict";
const expect = require('chai').expect;

const Query = require('../src/tile38_query');

describe('tile38 search query', function() {

    describe('factory methods', function () {
        it("should create INTERSECTS query", function () {
            let q = Query.intersects('fleet');
            let cmd = q.commandStr();
            expect(cmd).to.equal('INTERSECTS fleet');
        });
    });

    describe('offset and limit', function() {
        it("should parse offset option", function() {
            let q = Query.intersects('fleet').cursor(10);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('CURSOR');
            expect(cmd[2]).to.equal(10);
        });
        it("should parse limit option", function() {
            let q = Query.intersects('fleet').limit(50);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('LIMIT');
            expect(cmd[2]).to.equal(50);
        });
        it("should parse offset and limit", function() {
            let q = Query.intersects('fleet').cursor(100).limit(50);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('CURSOR');
            expect(cmd[2]).to.equal(100);
            expect(cmd[3]).to.equal('LIMIT');
            expect(cmd[4]).to.equal(50);
        });
    });

    describe('sparse', function() {
        it("should set sparse spread value", function () {
            let q = Query.intersects('fleet').sparse(5);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('SPARSE');
            expect(cmd[2]).to.equal(5);
        });
    });

    describe('match', function() {
        it("should set a match value", function () {
            let q = Query.intersects('fleet').match('someid*');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('MATCH');
            expect(cmd[2]).to.equal('someid*');
        });
        it("should set multiple match values", function () {
            let q = Query.intersects('fleet').match('someid*').match('other');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('MATCH');
            expect(cmd[2]).to.equal('someid*');
            expect(cmd[3]).to.equal('MATCH');
            expect(cmd[4]).to.equal('other');
        });
    });

    describe('order', function() {
        it("should set ASC or DESC in scan query", function () {
            let q = Query.scan('fleet').order('desc');
            expect(q.commandStr()).to.equal('SCAN fleet DESC');
        });
        it("should use shortcut asc() in scan query", function () {
            let q = Query.scan('fleet').asc();
            expect(q.commandStr()).to.equal('SCAN fleet ASC');
        });
        it("should use shortcut desc() in scan query", function () {
            let q = Query.scan('fleet').desc();
            expect(q.commandStr()).to.equal('SCAN fleet DESC');
        });
    });

    describe('timeout', function() {
        it("should set timeout on a scan query", function() {
            let q = Query.scan('mykey').where('foo', 1, 2).count().timeout(0.1);
            expect(q.commandStr()).to.equal("TIMEOUT 0.1 SCAN mykey WHERE foo 1 2 COUNT");
        });
    });

    describe('distance', function() {
        it("should set DISTANCE argument in nearby query", function () {
            let q = Query.nearby('fleet').distance();
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('DISTANCE');
        });
    });

    describe('where', function() {
        it("should set a where search", function () {
            let q = Query.intersects('fleet').where('age', 50, '+inf');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('WHERE');
            expect(cmd[2]).to.equal('age');
            expect(cmd[3]).to.equal(50);
            expect(cmd[4]).to.equal('+inf');
        });
        it("should set multiple where searches", function () {
            let q = Query.intersects('fleet').where('age', 60, '+inf').where('speed', 20);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('WHERE');
            expect(cmd[2]).to.equal('age');
            expect(cmd[3]).to.equal(60);
            expect(cmd[4]).to.equal('+inf');
            expect(cmd[5]).to.equal('WHERE');
            expect(cmd[6]).to.equal('speed');
            expect(cmd[7]).to.equal(20);
        });
    });

    describe('wherein', function() {
        it("should set a wherein search", function () {
            let q = Query.intersects('fleet').whereIn('wheels', 8, 14, 18, 22);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('WHEREIN');
            expect(cmd[2]).to.equal('wheels');
            expect(cmd[3]).to.equal(4);
            expect(cmd[4]).to.equal(8);
            expect(cmd[5]).to.equal(14);
            expect(cmd[6]).to.equal(18);
            expect(cmd[7]).to.equal(22);
        });
    });

    describe('whereeval', function() {
        it("should set a whereeval search", function () {
            let luaStr = "return FIELDS.wheels > ARGV[1] or (FIELDS.length * FIELDS.width) > ARGV[2]";
            let q = Query.intersects('fleet').whereEval(luaStr, 8, 120);

            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('WHEREEVAL');
            expect(cmd[2]).to.equal(luaStr); // lua script should be quoted
            expect(cmd[3]).to.equal(2);
            expect(cmd[4]).to.equal(8);
            expect(cmd[5]).to.equal(120);
        });
        it("should set multiple whereeval searches", function () {
            let q = Query.intersects('fleet').whereEval('script1', 10, 20).whereEval('script2', 30, 40, 50);
            expect(q.commandStr()).to.equal('INTERSECTS fleet WHEREEVAL script1 2 10 20 WHEREEVAL script2 3 30 40 50');
        });
    });

    describe('whereevalsha', function() {
        it("should set a whereevalsha search", function () {
            let q = Query.intersects('fleet').whereEvalSha('1234abc', 10, 20, 30, 40);
            expect(q.commandStr()).to.equal('INTERSECTS fleet WHEREEVALSHA 1234abc 4 10 20 30 40');
        });
    });

    describe('nofields', function() {
        it("should set nofields property", function () {
            let q = Query.intersects('fleet').nofields();
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('NOFIELDS');
        });
    });

    describe('detect', function() {
        it("should set single detect value", function () {
            let q = Query.intersects('fleet').detect('inside');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('DETECT');
            expect(cmd[2]).to.equal('inside');
        });
        it("should set multiple detect values from a single parameter", function () {
            let q = Query.intersects('fleet').detect('inside,outside');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('DETECT');
            expect(cmd[2]).to.equal('inside,outside');
        });
        it("should set multiple detect values from multiple parameters", function () {
            let q = Query.intersects('fleet').detect('inside','outside');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('DETECT');
            expect(cmd[2]).to.equal('inside,outside');
        });
    });
    describe('commands', function() {
        it("should set single command", function () {
            let q = Query.intersects('fleet').commands('del');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('COMMANDS');
            expect(cmd[2]).to.equal('del');
        });
        it("should set multiple detect values from a single parameter", function () {
            let q = Query.intersects('fleet').commands('del,drop');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('COMMANDS');
            expect(cmd[2]).to.equal('del,drop');
        });
        it("should set multiple detect values from multiple parameters", function () {
            let q = Query.intersects('fleet').commands('del','set');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('COMMANDS');
            expect(cmd[2]).to.equal('del,set');
        });

    });
    describe('output', function() {
        it("should set COUNT output format", function () {
            let q = Query.intersects('fleet').output('count');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('COUNT');
        });
        it("should set COUNT output format using convenience method", function () {
            let q = Query.intersects('fleet').count();
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('COUNT');
        });
        it("should set POINTS output format", function () {
            let q = Query.intersects('fleet').output('points');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('POINTS');
        });
        it("should set POINTS output format using convenience method", function () {
            let q = Query.intersects('fleet').points();
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('POINTS');
        });
        it("should set IDS output format using convenience method", function () {
            let q = Query.intersects('fleet').ids();
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('IDS');
        });
        it("should set HASHES output format, with precision", function () {
            let q = Query.intersects('fleet').output('hashes', 8);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('HASHES');
            expect(cmd[2]).to.equal(8);
        });
    });
    describe('get', function() {
        it("should store get query", function () {
            let q = Query.intersects('fleet').getObject('cities', 'oakland');
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('GET');
            expect(cmd[2]).to.equal('cities');
            expect(cmd[3]).to.equal('oakland');
        });
    });
    describe('bounds', function() {
        it("should store bounds query", function () {
            let q = Query.intersects('fleet').bounds(33.462, -112.268, 33.491, -112.245);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('BOUNDS');
            expect(cmd[2]).to.equal(33.462);
            expect(cmd[3]).to.equal(-112.268);
            expect(cmd[4]).to.equal(33.491);
            expect(cmd[5]).to.equal(-112.245);
        });
    });
    describe('geojson', function() {
        it("should store geojson query", function () {
            let polygon = {"type":"Polygon","coordinates":
                [[[-111.9787,33.4411],[-111.8902,33.4377],[-111.8950,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]};
            let exp = '{"type":"Polygon","coordinates":[[[-111.9787,33.4411],[-111.8902,33.4377],[-111.895,33.2892],[-111.9739,33.2932],[-111.9787,33.4411]]]}';

            let q = Query.intersects('fleet').object(polygon);
            let cmd = q.commandArr();
            expect(cmd[1]).to.equal('OBJECT');
            expect(cmd[2]).to.equal(exp);
        });
    });
    describe('tile', function() {
        it("should store tile query", function () {
            let q = Query.intersects('fleet').tile(10,20,30);
            let cmd = q.commandStr();
            expect(cmd).to.equal('INTERSECTS fleet TILE 10 20 30');
        });
    });
    describe('quadkey', function() {
        it("should store quadkey query", function () {
            let q = Query.intersects('fleet').quadKey(3242421);
            let cmd = q.commandStr();
            expect(cmd).to.equal('INTERSECTS fleet QUADKEY 3242421');
        });
    });
    describe('hash', function() {
        it("should store hash query", function () {
            let q = Query.intersects('fleet').hash('382ad23e');
            let cmd = q.commandStr();
            expect(cmd).to.equal('INTERSECTS fleet HASH 382ad23e');
        });
    });
    describe('point', function() {
        it("should store point query", function () {
            let q = Query.nearby('fleet').point(33.462, -112.268, 6000);
            let cmd = q.commandStr();
            expect(cmd).to.equal('NEARBY fleet POINT 33.462 -112.268 6000');
        });
        it("should allow nearby point query without radius", function () {
            let q = Query.nearby('fleet').point(33.462, -112.268);
            expect(q.commandArr().length).to.equal(4);
            let cmd = q.commandStr();
            expect(cmd).to.equal('NEARBY fleet POINT 33.462 -112.268');
        });

    });
    describe('circle', function() {
        it("should store circle query", function () {
            let q = Query.intersects('fleet').circle(33.462, -112.268, 200)
            let c = q.commandStr();
            expect(c).to.equal('INTERSECTS fleet CIRCLE 33.462 -112.268 200');
        });
    });
    describe('roam', function() {
        it("should store roam query", function () {
            let q = Query.nearby('fleet').roam('key', 'ptn', 3000);
            let cmd = q.commandStr();
            expect(cmd).to.equal('NEARBY fleet ROAM key ptn 3000');
        });
        it("should pass nodwell property", function () {
            let q = Query.nearby('people').nodwell().roam('friends', '*', 100);
            // this property is usually set when executeFence() is call.
            // Setting it manually here.
            q.options.fence = 'FENCE';
            expect(q.commandStr()).to.equal('NEARBY people FENCE NODWELL ROAM friends * 100');
        });
    });

});
