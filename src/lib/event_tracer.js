const async_hooks = require('async_hooks');

const default_event_serialization_fn = require("./helpers/default_event_serialization_fn");
const new_id_fn = require("./helpers/hex_id_fn");

const { LEVELS } = require("./constants");
const empty_span = require("./empty_span");

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

    const start_span = (require("./span"))(event_serialization_fn || default_event_serialization_fn);

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
            if (!map[eid]) return empty_span;
            const { head, pid } = map[eid];
            if (map[eid].span) {
                return map[eid].span.start({ name, head });
            }
            if (map[eid].parent_span) {
                map[eid].span = map[eid].parent_span.start({ name, head });
            } else {
                map[eid].span = start_span({ name, head, pid });
            }
            return map[eid].span;
        },
        new_id: new_id_fn
    };
};