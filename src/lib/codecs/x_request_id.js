const uuid_to_hex = require("./uuid_to_hex_fn");

module.exports = {
    decode: (str) => {
        if (!str || !str.split) return undefined;
        return {
            trace_id: uuid_to_hex(str),
            pid: undefined
        };
    },
    encode: (span) => {
        return "to-be-done";
    }
};