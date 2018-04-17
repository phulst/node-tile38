
const Tile38Client = require('tile38-client');
const client = new Tile38Client();


// construct the geofence query
let query = client.intersectsQuery('fleet').detect('enter','exit').bounds(33.462, -112.268, 33.491, -112.245);
// start the live geofence
let fence = query.executeFence((err, results) => {
    // this callback will be called multiple times
    if (err) {
        console.log("error: " + err);
    } else {
        console.dir(results);
    }
});

// if you want to be notified when the connection gets closed
fence.onClose(() => {
    console.log("geofence was closed");
});

// after 20 seconds, close the geofence again.
setTimeout(() => {
    fence.close();
}, 20000);
