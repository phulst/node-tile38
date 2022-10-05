## Revision history:
======
### 0.9.4 / October 4, 2022
  * Fixed issue #28 with WHEREEVAL command

### 0.9.3 / October 4, 2022
  * resolved another issue with package.json

### 0.9.2 / October 4, 2022
  * updated dependencies
  * fixed issue with incorrect version number in package-lock.json

### 0.9.1 / March 22, 2022
  * fixed an issue that caused the 0.9.0 version to not be properly published to npm

### 0.9.0 / November 29, 2021
  * fixed bug in chaining of options
  * fixed issues with new executeCommand function

### 0.8.0 / November, 2021
  * whenever a Promise is rejected, now passing back Error object instead of string #10
  * added NODWELL support for ROAM command #31
  * added support for TIMEOUT
  * added support for setting multiple fields using FSET
  * added support for RENAME and RENAMENX
  * updated package.json and cleaned up dependencies
  * fixed tests that broke against recent versions of Tile38

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
