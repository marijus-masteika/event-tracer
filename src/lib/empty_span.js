const { LEVELS } = require("./constants");
const EMPTY_FN = () => { };

const empty_span = {
    end: EMPTY_FN,
    tag: EMPTY_FN,
    log: EMPTY_FN,
};

empty_span.start = () => empty_span;

for (const key in LEVELS) empty_span[key.toLowerCase()] = () => empty_span; //jshint ignore: line


module.exports = empty_span;