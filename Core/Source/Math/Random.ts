namespace FudgeCore {
  /**
   * Class for creating random values, supporting Javascript's Math.random and a deterministig pseudo-random number generator (PRNG) 
   * that can be fed with a seed and then returns a reproducable set of random numbers (if the precision of Javascript allows) 
   * 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Random {
    private generate: Function = Math.random;

    /**
     * Create an instance of [[Random]]. If desired, creates a PRNG with it and feeds the given seed.
     * @param _ownGenerator
     * @param _seed 
     */
    constructor(_ownGenerator: boolean = false, _seed: number = Math.random()) {
      if (_ownGenerator)
        this.generate = Random.createGenerator(_seed);
    }

    /**
     * Creates a dererminstic PRNG with the given seed
     */
    public static createGenerator(_seed: number): Function {
      // TODO: replace with random number generator to generate predictable sequence
      return Math.random;
    }

    /**
     * Returns a normed random number, thus in the range of [0, 1[
     */
    public getNorm(): number {
      return this.generate();
    }

    /**
     * Returns a random number in the range of given [_min, _max[
     */
    public getRange(_min: number, _max: number): number {
      return _min + this.generate() * (_max - _min);
    }

    /**
     * Returns a random integer number in the range of given floored [_min, _max[
     */
    public getRangeFloored(_min: number, _max: number): number {
      return Math.floor(this.getRange(_min, _max));
    }

    /**
     * Returns true or false randomly
     */
    public getBoolean(): boolean {
      return this.generate() < 0.5;
    }

    /**
     * Returns -1 or 1 randomly
     */
    public getSign(): number {
      return this.getBoolean() ? 1 : -1;
    }

    /**
     * Returns a randomly selected index into the given array
     */
    public getIndex<T>(_array: Array<T>): number {
      if (_array.length > 0)
        return this.getRangeFloored(0, _array.length);
      return -1;
    }

    /**
     * Returns a randomly selected key from the given Map-instance
     */
    public getKey<T, U>(_map: Map<T, U>): T {
      let keys: General = Array.from(_map.keys());
      return keys[this.getIndex(keys)];
    }

    /**
     * Returns a randomly selected property name from the given object
     */
    public getPropertyName(_object: Object): string {
      let keys: string[] = Object.getOwnPropertyNames(_object);
      return keys[this.getIndex(keys)];
    }

    /**
     * Returns a randomly selected symbol from the given object, if symbols are used as keys
     */
    public getPropertySymbol(_object: Object): symbol {
      let keys: symbol[] = Object.getOwnPropertySymbols(_object);
      return keys[this.getIndex(keys)];
    }
  }
 
  /**
   * Standard [[Random]]-instance using Math.random().
   */
  export const random: Random = new Random();
}