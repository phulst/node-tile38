"use strict"
const Tile38 = require('../src/tile38');
const Query = require('../src/tile38_query');
require('chai').should();
const expect = require('chai').expect;


var assert = require('assert');
describe('tile38', function() {
    let tile38;

    beforeEach(function() {
        tile38 = new Tile38();
    });

    describe('ping', function() {

        it("should return 'pong'", (done) => {
            tile38.ping().then((resp) => {
                done();
            }).catch((err) => {
                done(new Error(err));
            })
        });
    });

    describe('quit', function() {

        it ("should close the connection", (done) => {
          setTimeout(() => {
            tile38.quit().then((resp) => {
                resp.should.equal('OK');
                done();
            });
          }, 300); // avoid warning message in on connect handler that connection is already closed
        });
    });

    describe('server', function() {

        it ("should return server status", (done) => {
            tile38.server().then((resp) => {
                // check a couple of properties from the response
                resp.id.should.exist;
                resp.mem_alloc.should.exist;
                resp.aof_size.should.exist;
                done();
            });
        });
    });

    describe('garbage collector', function() {

        it ("should call the garbage collector", (done) => {
            tile38.gc().then((resp) => {
                resp.should.be.true;
                done();
            });
        });
    });

    describe('flushdb', function() {

        it ("should destroy all data", (done) => {
            tile38.flushdb().then((resp) => {
                resp.should.be.true;
                done();
            });
        });
    });

    describe('config', function() {
        let randMemory = Math.floor(Math.random() * (256) + 256);

        it ("should get a config parameter", (done) => {
            tile38.configGet('protected-mode').then((properties) => {
                properties['protected-mode'].should.equal('yes');
                done();
            });
        });

        it ("should set a config parameter", (done) => {
            tile38.configSet('maxmemory', `${randMemory}MB`).then((res) => {
                res.should.be.true;
                done();
            });
        });

        it ("should persist changes set with configRewrite", (done) => {
            tile38.configRewrite().then((res) => {
                res.should.be.true;
                tile38.configGet('maxmemory').then((properties) => {
                    properties['maxmemory'].should.equal(`${randMemory}mb`);
                    done();
                });
            });
        });

    });

    describe('readonly', function() {

        it("should turn on readonly mode", (done) => {
            tile38.readOnly(true).then((res) => {
                res.should.be.true;
                done();
            });
        });
        it("should turn off readonly mode", (done) => {
            tile38.readOnly(false).then((res) => {
                res.should.be.true;
                done();
            });
        });
    });


    describe('redisEncodeCmd', function() {
        it("should encode roam query", function (done) {
            let q = Query.nearby('fleet').roam('key', 'ptn', 3000);
            let cmd = tile38.redisEncodeCommand(q.type, q.commandArr());
            expect(cmd).to.equal("*6\r\n$6\r\nNEARBY\r\n$5\r\nfleet\r\n$4\r\nROAM\r\n$3\r\nkey\r\n$3\r\nptn\r\n$4\r\n3000\r\n");
            done();
        });
    });
});
