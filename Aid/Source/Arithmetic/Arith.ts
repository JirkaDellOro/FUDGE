namespace FudgeAid {
  /**
   * Abstract class supporting versious arithmetical helper functions
   */
  export abstract class Arith {

    /**
     * Returns one of the values passed in, either _value if within _min and _max or the boundary being exceeded by _value
     */
    public static clamp<T>(_value: T, _min: T, _max: T, _isSmaller: (_value1: T, _value2: T) => boolean = (_value1: T, _value2: T) => { return _value1 < _value2; }): T {
      if (_isSmaller(_value, _min)) return _min;
      if (_isSmaller(_max, _value)) return _max;
      return _value;
    }
  }
}