module.exports = {
    decode: (str) => {
        if (!str || !str.split) return undefined;
        //00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01 => [version, trace_id, pid, flags]
        const traceparent = str.split("-");
        return {
            trace_id: traceparent[1],
            pid: traceparent[2]
        };
    },
    encode: (span) => {
        if (!span) return undefined;
        return `00-${span.trace_id}-${span.id}-01`;
    }
};