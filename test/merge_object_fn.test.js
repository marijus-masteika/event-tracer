const assert = require('assert');
const merge_object = require("../src/lib/helpers/merge_object_fn");
//const expect = require('chai').expect;

describe('flat_object_fn', () => {

    it("shall _patch 2 objects", () => {
        const obj1 = {
            a: 1
        };
        const obj2 = {
            b: "b"
        };
        
        assert.deepEqual(merge_object(obj1, obj2), {
            a: 1,
            b: "b"
        });
    });

});
