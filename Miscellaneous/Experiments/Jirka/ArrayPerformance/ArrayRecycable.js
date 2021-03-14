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
        pull() {
            this.ƒlength--;
            return this[this.ƒlength];
        }
        // *[Symbol.iterator](): IterableIterator<T> {
        //   for (let i: number = 0; i < this.ƒlength; i++)
        //     yield this[i];
        // }
        // tslint:disable-next-line: no-any
        // *generator(): Object {
        //   let iterations: number = 0;
        //   let next: Object = () => {
        //     let result: Object;
        //     if (iterations < 5) {
        //       result = { value: iterations, done: false };
        //       iterations++;
        //       return result;
        //     }
        //     return { value: iterations, done: true };
        //   };
        // }
        // tslint:disable-next-line:no-any
        [Symbol.iterator]() {
            let index = 0;
            return {
                next: () => {
                    if (index < this.ƒlength) {
                        return { value: this[index++], done: false };
                    }
                    else {
                        return { done: true };
                    }
                }
            };
        }
    }
    ArrayPerformance.ArrayRecycable = ArrayRecycable;
})(ArrayPerformance || (ArrayPerformance = {}));
