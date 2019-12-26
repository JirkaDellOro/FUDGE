namespace FudgeCore {
  export class Random {
    public static readonly standard: Random = new Random();
    private generate: Function = Math.random;

    constructor(_ownGenerator: boolean = false, _seed: number = Math.random()) {
      if (_ownGenerator)
        this.generate = Random.createGenerator(_seed);
    }

    public static createGenerator(_seed: number): Function {
      // TODO: replace with random number generator to generate predictable sequence
      return Math.random;
    }

    public getNorm(): number {
      return this.generate();
    }

    public getRange(_min: number, _max: number): number {
      return _min + this.generate() * (_max - _min);
    }

    public getRangeFloored(_min: number, _max: number): number {
      return Math.floor(this.getRange(_min, _max));
    }

    public getBoolean(): boolean {
      return this.generate() < 0.5;
    }

    public getSign(): number {
      return this.getBoolean() ? 1 : -1;
    }

    public getIndex<T>(_array: Array<T>): number {
      if (_array.length > 0)
        return this.getRangeFloored(0, _array.length);
      return -1;
    }

    public getKey<T, U>(_map: Map<T, U>): T {
      let keys: General = Array.from(_map.keys());
      return keys[this.getIndex(keys)];
    }

    public getPropertyName(_object: Object): string {
      let keys: string[] = Object.getOwnPropertyNames(_object);
      return keys[this.getIndex(keys)];
    }

    public getPropertySymbol(_object: Object): symbol {
      let keys: symbol[] = Object.getOwnPropertySymbols(_object);
      return keys[this.getIndex(keys)];
    }
  }
}