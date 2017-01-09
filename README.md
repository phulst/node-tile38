
# Tile38 Node driver

This library can be used to access the Tile38 server from Node.js apps. 


# Links
* [Tile38 website](http://tile38.com/)
* [Tile38 Github](https://github.com/tidwall/tile38)

# Installation

```
npm install tile38
```

# Overview

This library is functional, but not all commands have been implemented yet. 
In most cases, commands follow the [command documentation](http://tile38.com/commands/) on the Tile38 website.

## Connection 
 
```
var Tile38 = require('tile38'); 
var client = new Tile38();
// save a location
client.set('fleet', 'truck1', [33.5123, -112.2693]);
// save a location with additional fields
client.set('fleet', 'truck2', [33.5123, -112.2693], { value: 10, othervalue: 20});
```

You can pass any non-default connection settings into the Tile38 constructor, and you can also turn on 
optional debug logging as illustrated below. 

```
var client = new Tile38({host: 'host.server.com', port: 9850, debug: true });
```

## Promises

Any values are returned through promises. 

```
client.get('fleet', 'truck1').then( (data) => {
  console.log(data); // prints coordinates in geoJSON format 

}).catch( (err) =>
  console.log(err); // id not found  
});

// return the data as type POINT, and include FIELDS as well.  
client.get('fleet', 'truck2', {type: 'POINT', withfields: true}).then((data) => {
  console.log(`truck2 is at ${data.point.lat},${data.point.lon}`);
  console.dir(data.fields);
});
// There's also a getPoint(id,key) method that can be used as a shortcut instead of getPoint(id,key,{type:'POINT'})
// as well as getBounds and getHash methods. 
```

Many commands may not return values but you can still return promises if you need to wait until 
your changes have been persisted. 

```
client.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
  console.log('your changes have been persisted');
});

```



# Running tests

WARNING: THIS WILL WIPE OUT YOUR DATA!
The test suite currently depends on having a local instance of Tile38 running on port 9850 (instead of the default 9851).
It tests all supported commands, including FLUSHDB, so you'll LOSE ALL EXISTING DATA in your local db.

(I changed the default port for the test suite to make it less likely that someone accidentally runs the test suite
on a local database containing critical data.) 
 
If you have nothing critical in your local db, you can run the tests with: 

```
npm test
```


# Missing something? 

For bugs or feature requests, please open an issue.  
