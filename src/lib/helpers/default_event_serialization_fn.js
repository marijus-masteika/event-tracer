const stringify = require("./json_stringify_fn");

module.exports = (object) => _write_to_stdout(stringify(object));

//const fs = require("fs");
function _write_to_stdout(str) {
    //fs.writeSync(1, str + '\n');
    process.stdout.write(str + '\n');
}