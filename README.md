
# Tile38 Node driver

This library can be used to access the Tile38 server from Node.js apps. 


# Links
* [Project git repo](https://github.com/phulst/node-tile38)
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
// There's also a getPoint(id,key) method that can be used as a shortcut instead of get(id,key,{type:'POINT'})
// as well as similar getBounds and getHash methods. 
```

Many commands may not return values, but they still return promises, allowing you to wait until 
your changes have been persisted. 

```
client.set('fleet', 'truck1', [33.5123, -112.2693]).then(() => {
  console.log('your changes have been persisted');
});

```

# Command examples

The command documentation for Tile38 server is followed as closely as possible. Command names become function names, 
mandatory properties become arguments, and optional properties become either optional arguments or are passed in 
through an options object. 

For example, the command 

```
JGET key id path
```

is called as follows: 

```
client.jget(key, id, path)
```

## keys commands

Some examples of keys commands: 

```
client.bounds('fleet');
client.del('feet', 'truck2');
client.drop('fleet');
client.expire('fleet','truck',10);
client.fset('fleet', 'truck1', 'speed', 16);
client.stats('fleet1', 'fleet2');
...etc
```

### get command
The get command accepts an optional object that can be use to set the request data type: 


```
// return truck1 location as a geoJSON object
client.get('fleet', 'truck1');
client.get('fleet', 'truck1', { type: 'OBJECT' });   // does the same
// return as POINT (2 element array with lat/lon coordinates)
client.get('fleet', 'truck1', { type: 'POINT' });
client.getPoint('fleet', 'truck1');   // does the same as above
// return bounding rectangle
client.get('fleet', 'truck1', { type: 'BOUNDS' });
client.getBounds('fleet', 'truck1');   // does the same as above
// return a geohash with precision 6 (must be between 1 and 22)
client.get('fleet', 'truck1', { type: 'HASH 6' });
client.getHash('fleet', 'truck1', { precision: 6});   // does the same as above

// if you want the 'get' function to return fields as well, use the 'withfields' property
client.get('fleet', 'truck1', { withfields: true });   // does the same as above
```

### set commands

some examples: 

```
client.set('fleet', 'truck', { 

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

# Project roadmap

Below is a complete list of the commands that have not been implemented yet, and that are currently still in 
development. 

- The search commands (INTERSECTS, NEARBY, SCAN, SEARCH and WITHIN) have been implemented but the FENCE option 
(which is supposed to keep open a continuous stream) has not been implemented yet. This is in progress, and will 
also need to add some more code examples for these commands in the readme. 
- Webhooks (HOOKS, SETHOOK, DELHOOK, PDELHOOK)
- the AUTH command, connection to password protected servers
- Replication Commands (AOF, AOFMD5, AOFSHRINK, FOLLOW)



# Missing something? Did it break?

For bugs or feature requests, please open an issue.  
