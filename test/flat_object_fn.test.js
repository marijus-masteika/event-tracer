const assert = require('assert');
const flat_object = require("../src/lib/helpers/flat_object_fn");
//const expect = require('chai').expect;

describe('flat_object_fn', () => {

    it("shall handle object = null", () => {
        assert.deepEqual(flat_object(null), undefined);
    });
    it("shall handle object = undefined", () => {
        assert.deepEqual(flat_object(undefined), undefined);
    });
    it("shall handle object = false", () => {
        assert.deepEqual(flat_object(false), undefined);
    });
    it("shall handle object = 1", () => {
        assert.deepEqual(flat_object(1), undefined);
    });
    it("shall handle object = string", () => {
        assert.deepEqual(flat_object("hello"), undefined);
    });

    it("shall flatten with an object with a circular reference", () => {
        const obj = {
            a: 1,
            b: "b"
        };
        obj.o = obj; // making a circular reference
        assert.deepEqual(flat_object(obj), {
            a: 1,
            b: "b",
            o: "<<circular reference removed>>"
        });
    });

    it("when deep is 0", () => {
        const obj = {
            a: 1,
            b: "b"
        };
        assert.deepEqual(flat_object(obj, 0), {});
    });

    it("when deep is default", () => {
        const obj = {
            b1: {
                v: 1,
                b2: {
                    v: 2,
                    b3: {
                        v: 3,
                        b4: {
                            v: 4,
                            b5: {
                                v: 5
                            }
                        }
                    }
                }
            }
        };
        assert.deepEqual(flat_object(obj), {
            b1_b2_v: 2,
            b1_v: 1
        });

    });

    it("when deep is custom", () => {
        const obj = {
            b1: {
                v: 1,
                b2: {
                    v: 2,
                    b3: {
                        v: 3,
                        b4: {
                            v: 4,
                            b5: {
                                v: 5
                            }
                        }
                    }
                }
            }
        };

        assert.deepEqual(flat_object(obj, 4), {
            b1_v: 1,
            b1_b2_v: 2,
            b1_b2_b3_v: 3
        });
    });
    it("when obj has an array", () => {
        const obj = {
            a: [
                1,
                {
                    b: 2
                }
            ]
        };
        assert.deepEqual(flat_object(obj), {
            a_0: 1,
            a_1_b: 2
        });
    });
});
