const crypto = require("crypto");
module.exports = (length) => {
    return crypto.randomBytes(length || 8).toString("hex");
};