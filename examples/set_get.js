
const Tile38 = require('tile38');
const client = new Tile38();

// set a coordinate
client.set('fleet', 'truck', [33.5123, -112.2693]);

// retrieve it as geojson object:
client.get('fleet', 'truck').then(obj => {
    // will print:  { object: { type: 'Point', coordinates: [ -112.2693, 33.5123 ] } }
    console.dir(obj);
});

// retrieve it as a simple point
client.getPoint('fleet', 'truck').then(obj => {
    // will print:  { point: { lat: 33.5123, lon: -112.2693 } }
    console.dir(obj);
});
