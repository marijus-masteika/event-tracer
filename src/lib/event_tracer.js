const async_hooks = require('async_hooks');

const flat_object_fn = require("./helpers/flat_object_fn");
const default_event_serialization_fn = require("./helpers/default_event_serialization_fn");
const new_id_fn = require("./helpers/hex_id_fn");
const now = require("./helpers/now_fn");

const UNKNOWN_NAME = "?";
const EMPTY_FN = () => { };
const LEVELS = {
    SILENT: Infinity,
    TRACE: 10,
    DEBUG: 20,
    INFO: 30,
    WARN: 40,
    ERROR: 50,
    FATAL: 60,
};



const asyncHook = async_hooks.createHook({
    init,
    destroy
});

asyncHook.enable();

const map = {};

function init(asyncId, type, triggerAsyncId, resource) {

    if (!map[triggerAsyncId]) return;
    map[asyncId] = {
        head: map[triggerAsyncId].head,
        id: new_id_fn(),
        pid: map[triggerAsyncId].id,
        parent_span: map[triggerAsyncId].span || map[triggerAsyncId].parent_span
    };

}

function destroy(asyncId) {
    delete map[asyncId];
}

module.exports = (event_serialization_fn) => {

    event_serialization_fn = event_serialization_fn || default_event_serialization_fn;

    function start_span(name, pid) {

        const tid = async_hooks.executionAsyncId();
        if (!map[tid]) return empty_span;

        name = name || UNKNOWN_NAME;

        const head = map[tid].head;

        const id = new_id_fn();

        event({
            ...head,
            pid: pid,
            name: name,
            start: now()
        });

        function log(...args) {

            event({
                logs: [...args.map(arg => {
                    return {
                        time: now(),
                        ...(typeof arg == "object" ? arg : {
                            msg: arg + ""
                        })
                    };
                })]
            });

        }

        function event(...args) {

            const msg = {};

            for (const arg of args) Object.assign(msg, arg);

            msg.trace_id = head.trace_id;
            msg.id = id;

            event_serialization_fn(msg);

        }

        const span = {
            start: (name) => start_span(name, id),
            end: () => {
                event({
                    end: now()
                });
            },
            tag: (...args) => {
                let tags = {};
                for (const arg of args) {
                    tags = {
                        ...tags,
                        ...flat_object_fn(arg)
                    };
                }
                event({
                    tags: tags
                });
            },
            log: log,
            id: id,
            trace_id: head.trace_id
        };

        for (const key in LEVELS) {
            span[key.toLowerCase()] = (...msg) => { // jshint ignore:line
                if (LEVELS[key] < head.level) return empty_span;
                log({ severity: LEVELS[key] }, ...msg);
                return span;
            };
        }

        return span;

    }

    return {
        init: function (options) {
            const head = { ...options };
            const eid = async_hooks.executionAsyncId();
            head.trace_id = head.trace_id || new_id_fn(16);

            if (typeof head.level === "string") head.level = LEVELS[head.level.toUpperCase()] || LEVELS.INFO;

            map[eid] = {
                head: head,
                id: new_id_fn(),
                pid: head.pid //??? should it be parent_id???
            };
        },
        start: (name) => {
            const eid = async_hooks.executionAsyncId();
            if (!map[eid]) return empty_span();
            if (map[eid].span) {
                return map[eid].span.start(name);
            }
            if (map[eid].parent_span) {
                map[eid].span = map[eid].parent_span.start(name);
            } else {
                map[eid].span = start_span(name, map[eid].pid);
            }
            return map[eid].span;
        },
        new_id: new_id_fn
    };
};


function empty_span() {
    const span = {
        start: empty_span,
        end: EMPTY_FN,
        tag: EMPTY_FN
    };

    for (const key in LEVELS) {
        span[key.toLowerCase()] = () => empty_span; //jshint ignore: line
    }
    return span;
}