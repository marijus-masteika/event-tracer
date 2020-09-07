const assert = require('assert');
//const expect = require('chai').expect;
const rewire = require('rewire');
const https = require("https");

const span_mock_fn = (id_hook, now_hook) => {
    const start_span = rewire("../src/lib/span");
    start_span.__set__("new_id_fn", id_hook);
    start_span.__set__("now", now_hook);
    return start_span;
};

describe('Span', () => {

    let id_hook = () => 0;
    let now_hook = () => 1971;
    let event_hook = (msg) => {

    };
    const start_span = (span_mock_fn(id_hook, now_hook))((msg) => {
        event_hook(msg);
    });

    it("tag", () => {

        const a = {
            a: 1
        };
        const b = {
            b: {
                b: 1
            }
        };
        const c = {
            c: {
                c: {
                    c: 1
                }
            }
        };
        const d = {
            d: ["1", 2]
        };
        event_hook = (msg) => { };
        const span = start_span({});
        event_hook = (msg) => {
            assert.deepEqual(msg, {
                id: 0,
                tags: {
                    a: 1,
                    b_b: 1,
                    c_c_c: "1",
                    d_0: "1",
                    d_1: 2
                }
            });
        };
        span.tag({ ...a, ...b, ...c, ...d });
    });

    it("output a complex object - https", () => {
        event_hook = (msg) => { };
        const span = start_span({ head: { level: "info" } });

        const https = require('https');

        const options = {
            hostname: 'encrypted.google.com',
            port: 443,
            path: '/',
            method: 'GET'
        };

        const req = https.request(options, (res) => { });
        event_hook = (msg) => { };
        span.tag(req);

        event_hook = (msg) => { };
        span.log(req);

        event_hook = (msg) => { throw "it should not reach this line"; };
        span.trace().tag(req);

        req.end();
    });

    it("log ", () => {
        event_hook = (msg) => { };
        const span = start_span({ head: { level: "info" } });

        event_hook = (msg) => { throw new Error("it should not reach this line"); };
        span.trace();
        span.info();
        span.log();

        event_hook = (msg) => {
            assert.deepEqual(msg, { "logs": [{ "time": 1971, "msg": "x" }], "level": "info", "id": 0 });
        };
        span.log("x");

        event_hook = (msg) => {
            assert.deepEqual(msg, { "logs": [{ "time": 1971, a: 1 }], "level": "info", "id": 0 });
        };
        span.log({
            a: 1
        });

    });

    it("log level", () => {
        event_hook = (msg) => { };
        const spans = [];
        spans.push(start_span({ level: "inFo" }));
        spans.push(start_span({ level: "infoo" }));
        spans.push(start_span({}));
        spans.push(start_span());

        function tst(fn, should_trigger_event) {
            if (should_trigger_event) {
                let action = false;
                event_hook = (msg) => { action = true; };
                fn("x");
                assert(action, true);
            } else {
                event_hook = (msg) => { throw new Error("it should not reach this line"); };
                fn("x");
            }
        }

        for (const span of spans) {
            tst(span.debug, false);
            tst(span.info, true);    
        }

    });


    it("check functions", () => {

        event_hook = (msg) => {
            const { trace_id, id } = msg;
            if (trace_id !== "trace_id_1") console.log(msg);
            assert.equal(trace_id, "trace_id_1");
            assert.equal(id, 0);
        };

        const head = {
            trace_id: "trace_id_1"
        };
        const span = start_span({
            name: "name_1", pid: "pid_1", head
        });
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
        span.log("aaa");

    });

});
