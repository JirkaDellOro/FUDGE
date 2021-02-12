"use strict";
var ArrayPerformance;
(function (ArrayPerformance) {
    class ArrayRecycable extends Array {
        constructor() {
            super(...arguments);
            this.ƒlength = 0;
        }
        get length() {
            return this.ƒlength;
        }
        reset() {
            this.ƒlength = 0;
        }
        push(_entry) {
            this[this.ƒlength] = _entry;
            this.ƒlength++;
            return this.ƒlength;
        }
    }
    ArrayPerformance.ArrayRecycable = ArrayRecycable;
})(ArrayPerformance || (ArrayPerformance = {}));
