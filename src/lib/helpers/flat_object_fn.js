module.exports = (obj, max_deep) => {

    if (!obj || typeof obj !== "object") return undefined;

    max_deep = isNaN(max_deep) ? 3 : max_deep;

    const flat_obj = {};
    
    const seen = new WeakSet();
    seen.add(obj);
    
    for (const key in obj) {
        scan(obj[key], `${key}`, 1);
    }

    function scan(object, pth, depth) {
        if (depth > max_deep) return;
        if (typeof object === "object" && object !== null) {
            if (seen.has(object)) {
                flat_obj[pth] = "<<circular reference removed>>";
            } else {
                seen.add(object);
                for (const key in object) {
                    scan(object[key], `${pth}_${key}`, depth + 1);
                }
            }

        } else {
            flat_obj[pth] = object;
        }
    }
    return flat_obj;
};