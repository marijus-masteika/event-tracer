const assert = require('assert');
const empty_span = require("../src/lib/empty_span");

describe('empty_span', () => {

    it("empty span functions", () => {

        const span = empty_span;
        span.start().start();
        span.end();
        span.tag({
            a: 1
        });
        span.warn("aaa");
        span.info("aaa");
        span.info().log("aaa");
        span.error("aaa");
        span.trace("aaa");
        span.silent("aaa");
        span.debug("aaa");
        span.fatal("aaa");
        span.log();
    });

});
