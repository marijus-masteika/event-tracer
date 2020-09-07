const { LEVELS, UNKNOWN_NAME } = require("./constants");
const flat_object_fn = require("./helpers/flat_object_fn");
const now = require("./helpers/now_fn");
const empty_span = require("./empty_span");
const new_id_fn = require("./helpers/hex_id_fn");
const merge_object_fn = require("./helpers/merge_object_fn");

module.exports = (event_serialization_fn) => {

    return function start_span(options) {
        options = options || {};
        const name = options.name || UNKNOWN_NAME;
        const head = options.head || {};
        const pid = options.pid;
        const id = new_id_fn();
        const log_level = typeof options.level === "string" ? LEVELS[options.level.toUpperCase()] || LEVELS.INFO : LEVELS.INFO;

        event({ name, start: now(), pid });

        function event(...args) {
            const msg = {};
            for (const arg of args) merge_object_fn(msg, arg);
            Object.assign(msg, head);
            msg.id = id;
            event_serialization_fn(msg);
        }

        const span = {
            start: (name) => start_span({ name, pid: id, head }),
            end: () => event({ end: now() }),
            tag: (properties) => event({ tags: flat_object_fn(properties) }),
            log: (message) => {
                if (message) event({
                    logs: [{
                        time: now(),
                        ...(typeof message == "object" ? message : {
                            msg: message + ""
                        })
                    }]
                });
            },
            id: id,
            trace_id: head.trace_id
        };

        for (const key in LEVELS) {
            const severity = LEVELS[key];
            span[key.toLowerCase()] = severity < log_level ? () => empty_span : (message) => { // jshint ignore:line
                if (message) span.log({
                    ...message,
                    severity
                });
                return span;
            };
        }

        return span;

    };

};

