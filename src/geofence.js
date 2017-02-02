
// represents a GeoFence in Tile38
class Geofence {
    
    /**
     * The following properties may be passed:
     *
     * command: (del,drop,set) (array, or string with single or comma separated values)
     * detect: (inside,outside,enter,exit,cross) (array, or string with single or comma separated values)
     * output: (count|ids|objects|points|bounds|hashes N) specify one of these values (hashes should be followed by precision)
     *
     * one of the following properties must be set:
     * getObject: [key, id]   to identify any object already in database
     * 
     * @param opts
     */
    constructor(opts) {
        if (opts == undefined ) {
            throw new Error("Constructor for GeoFence requires an options object");
        }
        this.options = opts;
    }
    
    // returns an array of commands and options to be sent as part of the command string. 
    commands() {

        let cmd = [];
        if (this.options.detect) {
            let values = this.assertValues(this.options.detect, 'options.detect',
                ['inside','outside','enter','exit','cross'], true);
            cmd.push('DETECT');
            cmd.push(values.join(','));
        }

        if (this.options.commands) {
            let commands = this.assertValues(this.options.commands, 'options.commands',
                ['del','set','drop'], true);
            cmd.push('COMMANDS');
            cmd.push(commands.join(','));
        }

        // output must be a single value
        if (this.options.output) {
            cmd.push(this.options.output.toUpperCase());
            if (this.options.output == 'hashes') {
                // add Hash precision if HASHES used
                cmd.push(this.options.hashPrecision);
            }
        }

        if (this.options.getObject) {
            cmd.push('GET');
            let val = this.options.getObject;
            cmd.push(val[0]);
            cmd.push(val[1]);
        }

        if (this.options.bounds) {
            cmd.push('BOUNDS');
            let val = this.options.bounds;
            for (let k of val) { // we should have 4 values here.
                cmd.push(k);
            }
        }

        if (this.options.object) {
            cmd.push('OBJECT');
            let val = this.options.object;
            cmd.push(JSON.stringify(val));
        }

        if (this.options.tile) {
            cmd.push('TILE');
            let val = this.options.tile;
            for (let k of val) { // we should have 3 values: x,y,z
                cmd.push(k);
            }
        }

        if (this.options.quadkey) {
            cmd.push('QUADKEY');
            cmd.push(this.options.quadkey);
        }

        if (this.options.hash) {
            cmd.push('HASH');
            cmd.push(this.options.hash);
        }

        return cmd;
    }

    validateOptions() {
        // if (this.options.detect) {
        //     this.assertArrayWithValues(this.options.detect, 'options.detect', ['inside','outside','enter','exit','cross'], true);
        // }
        // if (this.options.commands) {
        //     this.assertArrayWithValues(this.options.commands, 'options.commands', ['del','set','drop'], true);
        // }
    }

    
    assertValues(arr, name, expectedValues, multiple) {
        let values;
        if (!Array.isArray(arr)) {
            values = arr.split(',');
        } else {
            values = arr;
        }
        if (!multiple && values.length > 0) {
            let msg = `${name} may only have one of the following values: ${expectedValues.join(',')}`;
            throw new Error(msg);
        }
        return values;
        // TODO: check that all values in arr exist in expectedValues
    }

}

module.exports = Geofence;