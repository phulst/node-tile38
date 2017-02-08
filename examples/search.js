
const Tile38 = require('../src/tile38');
const client = new Tile38({debug: true});


/*
 * have 10 users move around randomly inside the map_bounds
 */
map_bounds = [37.6930029, -122.33026355,  37.844208, -122.153541];

// return a random coordinate inside given bounds
function randomPointInBounds(swLat, swLon, neLat, neLon) {
    let randLat = Math.random() * (neLat - swLat) + swLat;
    let randLon = Math.random() * (neLon - swLon) + swLon;
    return [randLat, randLon];
}
let user = 1;
function sendCoords() {
    client.set('eastbay', "user" + user, randomPointInBounds(...map_bounds));
    user = user + 1;
    if (user == 11) user = 1;
}
setInterval(() => {
    sendCoords();
}, 1000);




/*
 * create a live geofence to receive updates when object enter/exit an area within 2000m radius of a point. 
 */
nearPiedmont = client.nearbyQuery('eastbay').detect('enter','exit').output('points').point(37.822357, -122.232007, 2000);
nearPiedmont.executeFence((err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results.id + ": " + results.detect + " Piedmond 2k radius");
        // console.dir(results);
    }
});


/*
 * create a live geofence to find objects that fall within given bounds
 */
withinSomeBounds = client.withinQuery('eastbay').detect('enter','exit').bounds(37.759704,-122.218763, 37.810648, -122.181591);
withinSomeBounds.executeFence((err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results.id + ": " + results.detect + " inner bounds area");
        // console.dir(results);
    }
});


/*
 * create a live geofence to find objects that fall within a given Polygon
 */
let polygon = { type: "Polygon", coordinates: [[
    [-122.3300231682738,37.78158260714663],
    [-122.2349811979788,37.75009376613725],
    [-122.2246718616854,37.75530988561864],
    [-122.2253442927083,37.76667594878754],
    [-122.2794064696383,37.79227940644699],
    [-122.3308765320844,37.79628967707779],
    [-122.3300231682738,37.78158260714663]
    ]]};
withinAlameda = client.withinQuery('eastbay').detect('enter','exit').object(polygon);
withinAlameda.executeFence((err, results) => {
    if (err) {
        console.error(err);
    } else {
        console.log(results.id + ": " + results.detect + " Alameda polygon area");
        // console.dir(results);
    }
});



