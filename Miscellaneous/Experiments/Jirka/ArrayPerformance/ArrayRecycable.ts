namespace ArrayPerformance {
  export class ArrayRecycable<T> extends Array<T> {
    private ƒlength: number = 0;

    public get length(): number {
      return this.ƒlength;
    }

    public reset(): void {
      this.ƒlength = 0;
    }

    public push(_entry: T): number {
      this[this.ƒlength] = _entry;
      this.ƒlength++;
      return this.ƒlength;
    }

    public pull(): T {
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
    [Symbol.iterator](): any {
      let index: number = 0;
      return {
        next: () => {
          if (index < this.ƒlength) {
            return { value: this[index++], done: false };
          } else {
            return { done: true };
          }
        }
      };
    }
  }
}