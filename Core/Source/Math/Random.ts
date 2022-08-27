namespace FudgeCore {
  /**
   * Class for creating random values, supporting Javascript's Math.random and a deterministig pseudo-random number generator (PRNG) 
   * that can be fed with a seed and then returns a reproducable set of random numbers (if the precision of Javascript allows) 
   * 
   * @author Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Random {
    public static default: Random = new Random();
    private generate: Function = Math.random;

    /**
     * Create an instance of {@link Random}. 
     * If a seed is given, LFIB4 is used as generator, reproducing a series of numbers from that seed.
     * If a function producing values between 0 and 1 is given, it will be used as generator.
     */
    constructor(_seedOrFunction?: number | Function) {
      if (_seedOrFunction instanceof Function)
        this.generate = _seedOrFunction;
      else if (_seedOrFunction == undefined)
        this.generate = Math.random;
      else
        //@ts-ignore
        this.generate = new LFIB4(_seedOrFunction);
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
     * Returns a randomly selected element of the given array
     */
    public getElement<T>(_array: Array<T>): T {
      if (_array.length > 0)
        return _array[this.getIndex(_array)];
      return null;
    }

    /**
     * Removes a randomly selected element from the given array and returns it
     */
    public splice<T>(_array: Array<T>): T {
      return _array.splice(this.getIndex(_array), 1)[0];
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
    public getPropertyName<T>(_object: T): keyof T {
      let keys: string[] = Object.getOwnPropertyNames(_object);
      return <keyof T>keys[this.getIndex(keys)];
    }

    /**
     * Returns a randomly selected symbol from the given object, if symbols are used as keys
     */
    public getPropertySymbol<T>(_object: T): symbol {
      let keys: symbol[] = Object.getOwnPropertySymbols(_object);
      return keys[this.getIndex(keys)];
    }

    /**
     * Returns a random three-dimensional vector in the limits of the box defined by the vectors given as [_corner0, _corner1[
     */
    public getVector3(_corner0: Vector3, _corner1: Vector3): Vector3 {
      return new Vector3(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y), this.getRange(_corner0.z, _corner1.z));
    }

    /**
     * Returns a random two-dimensional vector in the limits of the rectangle defined by the vectors given as [_corner0, _corner1[
     */
    public getVector2(_corner0: Vector2, _corner1: Vector2): Vector2 {
      return new Vector2(this.getRange(_corner0.x, _corner1.x), this.getRange(_corner0.y, _corner1.y));
    }
  }

  /**
   * Standard {@link Random}-instance using Math.random().
   */
  export const random: Random = new Random();
}