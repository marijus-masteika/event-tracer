module.exports = update;

function update(obj /*, …*/ ) {
    for (var i = 1; i < arguments.length; i++) {
        for (var prop in arguments[i]) {
            var val = arguments[i][prop];
            if (Array.isArray(obj[prop])) {
                obj[prop] = obj[prop].concat(val);
            } else if (typeof val == "object" && obj[prop]) // this also applies to arrays or null!
                update(obj[prop], val);
            else if (val) obj[prop] = val;
        }
    }
    return obj;
}