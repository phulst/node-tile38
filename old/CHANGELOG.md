## Revision history:
======
### 0.7.0 / August, 2019
  * Fixed #20, FENCE duplicate in query to server
  * Fixed #21, added support for custom logger
  * Fixed #22, failure parsing responses after server reconnect
  * Updated dependencies to fix security vulnerabilities

### 0.6.7 / March, 2019
  * Fixed broken test due to changed response on BOUNDS query
  * Added support for WHEREIN, WHEREEVAL, WHEREEVALSHA, CLIP, CIRCLE


#### 0.6.6 / May 23, 2018
  * updated test & babel dependencies to fix security vulnerability
  * fix for issue #5 (nearby query without radius)

#### 0.6.5 / May 22, 2018
  * fixed bugs in redis communication
  * added support for Tile38 server authentication
  * added option to use TILE38_PASSWD env variable for authentication
  * added option to use TILE38_PORT env variable for port config
  * added option to use TILE38_HOST env variable for host config
  * tests now run on default port 9851 unless TILE38_PORT is set
  * fixed auth() function (though there should be no need to call this directly)
  * added error handler with logging for redis client  

#### 0.6.4 / Feb 22, 2017
  * added convenience methods such as ids(), count() that can be used instead of output('ids'), output('count'), etc.
  * added support for AUTH command
  * onClose() for live fence now accepts callback method
  * fixed incorrect warning message

#### 0.6.3 / Feb 21, 2017
  * Adding capability to create webhooks with roaming geofenced search

#### 0.6.2 / Feb 7, 2017
  * Fixed issue with Redis command encoding for live fence queries

#### 0.6.1 / Feb 6, 2017
  * Module packaging fix

#### 0.6.0 / Feb 6, 2017
  * Added support for live geofences

#### 0.5.0 / Feb 3, 2017
  * Implemented method chaining for search methods. Improved test coverage and improved README with search query examples


Anything older than 0.5.0 was never used by anyone but the author.  
