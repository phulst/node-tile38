
# Tile38 Node driver

This library can be used to access the Tile38 server from Node.js apps. 


# Links
* [Tile38 website](http://tile38.com/)
* [Tile38 Github](https://github.com/tidwall/tile38)

# installation

```
npm install tile38
```

# Overview

This library is functional, but not all commands have been implemented yet. 
In most cases, commands follow the command documentation on the Tile38 website. 

```
client = new Tile38();
// save a location
client.set('fleet', 'truck1', [33.5123, -112.2693]);

// retrieve it back
client.get('fleet', 'truck1');
```

