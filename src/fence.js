'use strict';

const net = require('net');
const Parser = require("redis-parser");

function openFence(host, port, command, callback, closed) {
	let client = new net.Socket();
	let ok = false;
	client.connect(port, host, () => {
	    client.write(command + "\r\n");
	});

	if (closed) {
		client.on('close', () => {
		    closed();
		});
	}
	let buf = "";

    var parser = new Parser({
        returnReply: function(reply) {
            if (reply != 'OK') { // ignore the initial 'OK' reponse
                callback(null, JSON.parse(reply));
            }
        },
        returnError: function(err) {
            callback(err, null);
        },
        returnFatalError: function(err) {
            console.log('FATAL: ' + err);
            client.destroy();
            callback(err, null);
        }
    });


    client.on('data', buffer => {
	    //console.log(JSON.stringify(buffer.toString()));
	    parser.execute(buffer);
    });
	// client.on('data', data =>  {
	//     console.log('received');
	//     console.dir(data.toString());
    //
	// 	if (!ok){
	// 		if (data != "+OK\r\n"){
	// 			if (data.indexOf("-")==0){
	// 				fail(data.toString().substring(1).split("\r\n")[0]);
	// 			} else {
	// 				//fail("unexpected response");
	// 			}
	// 		}else{
	// 			ok = true;
	// 		}
	// 		return
	// 	}
	// 	buf += data.toString();
	// 	while (buf.length > 0){
	// 		if (buf.indexOf("$")==0){
	// 			var sidx = buf.indexOf("\r\n");
	// 			if (sidx == -1){
	// 				return // not ready
	// 			}
	// 			var size = parseInt(buf.slice(1, sidx));
	// 			if (isNaN(size)){
	// 				fail("invalid response");
	// 				return
	// 			}
	// 			var s = sidx+2;
	// 			var e = s+size+2;
	// 			if (e > buf.length){
	// 				return; // not ready
	// 			}
	// 			if (buf.slice(e-2,e)!= "\r\n"){
	// 				fail("invalid response");
	// 				return;
	// 			}
	// 			var msg = buf.slice(s, e-2);
	// 			if (callback){
	// 				callback(null, msg);
	// 			}
	// 			buf = buf.slice(e);
	// 		}
	// 	}
	// });
	// let fail = function(msg) {
	//     callback(msg, null);
	// 	client.destroy();
	// }
}

module.exports = openFence;