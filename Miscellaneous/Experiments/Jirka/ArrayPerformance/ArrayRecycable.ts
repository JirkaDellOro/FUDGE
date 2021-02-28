namespace ArrayPerformance {
  export class ArrayRecycable extends Array {
    private ƒlength: number  = 0;

    public get length(): number {
      return this.ƒlength;
    }

    public reset(): void {
      this.ƒlength = 0;
    }

    public push(_entry: Object): number {
      this[this.ƒlength] = _entry;
      this.ƒlength++;
      return this.ƒlength;
    }
  }
}