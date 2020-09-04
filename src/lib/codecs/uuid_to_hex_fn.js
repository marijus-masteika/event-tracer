module.exports = (uuid) => uuid.split('-').map((number, index) =>
    (index < 3 ? number.match(/.{1,2}/g).reverse() : number.match(/.{1,2}/g)).join("")
).join("");