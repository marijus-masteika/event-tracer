const assert = require('assert');
//const expect = require('chai').expect;
const rewire = require('rewire');

describe('tracing spans', () => {
    let ctx;
    let event_hook;
    let aid_hook = () => 0;
    let id = 0;
    let id_hook = () => id++;
    let now_hook = () => 1971;
    let init_fn;
    let destroy_fn;
    before(() => {
        const tracer = rewire("../src/lib/event_tracer");
        tracer.__set__("async_hooks", {
            createHook: (init, destroy) => {
                init_fn = init;
                destroy_fn = destroy;
                return {
                    enable: () => { }
                };
            },
            executionAsyncId: () => aid_hook
        });
        tracer.__set__("new_id_fn", id_hook);
        tracer.__set__("now", now_hook);

        ctx = tracer((msg => {
            event_hook(msg);
        }));

    });

    it("empty", () => {
        event_hook = (msg) => {
            assert(false, "should not reach this line");
        };

        const span = ctx.start();
        span.start().start();
        span.end();
        span.tag({
            a: 1
        });
        span.warn("aaa");
        span.info("aaa");
        span.error("aaa");
        span.trace("aaa");
        span.silent("aaa");
        span.debug("aaa");
        span.fatal("aaa");


    });
    it("span0", () => {
        ctx.init({
            trace_id: "777",
            level: "info",
            pid: "333",
            service: "test777"
        });
        event_hook = (msg) => {
            assert.deepEqual(msg, {
                trace_id: '777',
                level: 30,
                pid: '333',
                service: 'test777',
                name: 'span0',
                start: 1971,
                id: 0
            });
        };
        id = 0;
        const span = ctx.start("span0");
        event_hook = (msg) => {};
        span.info("aaa");
    });
    // it("span1", () => {
    //     event_hook = (msg) => {
    //         assert.deepEqual(msg, {
    //             trace_id: '777',
    //             level: 30,
    //             pid: '333',
    //             service: 'test777',
    //             name: 'span1',
    //             start: 1971,
    //             id: 0
    //         });
    //     };
    //     id = 1;
    //     const span = ctx.start("span1");
    // });
});
