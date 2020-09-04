module.exports = {
    tracer: require("./lib/event_tracer"),
    codecs: {
        traceparent: require("./lib/codecs/traceparent"),
        x_request_id: require("./lib/codecs/x_request_id")
    }
};