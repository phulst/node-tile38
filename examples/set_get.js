
const Tile38 = require('../src/tile38');
const client = new Tile38();

// set a coordinate
client.set('fleet', 'truck1', [33.5123, -112.2693]);

// set a coordinate, with completion handler and error handler
client.set('fleet', 'truck2', [33.5211, -112.2710]).then(() => {
    console.log("done");
}).catch(err => {
    console.error(err);
});


// retrieve it as geojson object:
client.get('fleet', 'truck1').then(obj => {
    // will print:  { object: { type: 'Point', coordinates: [ -112.2693, 33.5123 ] } }
    console.dir(obj);
});

// retrieve it as a simple point
client.getPoint('fleet', 'truck2').then(obj => {
    // will print:  { point: { lat: 33.5211, lon: -112.271 } }
    console.dir(obj);
});


// same as above but adds error handling:
client.getPoint('fleet', 'truck2').then(obj => {
    // will print:  { point: { lat: 33.5211, lon: -112.271 } }
    console.dir(obj);
}).catch(err => {
    console.error(err);
});
