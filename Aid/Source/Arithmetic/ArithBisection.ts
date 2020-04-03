namespace FudgeAid {
  /**
   * Within a given precision, an object of this class finds the parameter value at which a given function 
   * switches its boolean return value using interval splitting (bisection). 
   * Pass the type of the parameter and the type the precision is measured in.
   */
  export class ArithBisection<Parameter, Epsilon> {
    /** The left border of the interval found */
    public left: Parameter;
    /** The right border of the interval found */
    public right: Parameter;
    /** The function value at the left border of the interval found */
    public leftValue: boolean;
    /** The function value at the right border of the interval found */
    public rightValue: boolean;

    private function: (_t: Parameter) => boolean;
    private divide: (_left: Parameter, _right: Parameter) => Parameter;
    private isSmaller: (_left: Parameter, _right: Parameter, _epsilon: Epsilon) => boolean;

    /**
     * Creates a new Solver
     * @param _function A function that takes an argument of the generic type <Parameter> and returns a boolean value.
     * @param _divide A function splitting the interval to find a parameter for the next iteration, may simply be the arithmetic mean
     * @param _isSmaller A function that determines a difference between the borders of the current interval and compares this to the given precision 
     */
    constructor(
      _function: (_t: Parameter) => boolean,
      _divide: (_left: Parameter, _right: Parameter) => Parameter,
      _isSmaller: (_left: Parameter, _right: Parameter, _epsilon: Epsilon) => boolean) {
      this.function = _function;
      this.divide = _divide;
      this.isSmaller = _isSmaller;
    }

    /**
     * Finds a solution with the given precision in the given interval using the functions this Solver was constructed with.
     * After the method returns, find the data in this objects properties.
     * @param _left The parameter on one side of the interval.
     * @param _right The parameter on the other side, may be "smaller" than [[_left]].
     * @param _epsilon The desired precision of the solution.
     * @param _leftValue The value on the left side of the interval, omit if yet unknown or pass in if known for better performance.
     * @param _rightValue The value on the right side of the interval, omit if yet unknown or pass in if known for better performance.
     * @throws Error if both sides of the interval return the same value.
     */
    public solve(_left: Parameter, _right: Parameter, _epsilon: Epsilon, _leftValue: boolean = undefined, _rightValue: boolean = undefined): void {
      this.left = _left;
      this.leftValue = _leftValue || this.function(_left);
      this.right = _right;
      this.rightValue = _rightValue || this.function(_right);

      if (this.isSmaller(_left, _right, _epsilon))
        return;

      if (this.leftValue == this.rightValue)
        throw(new Error("Interval solver can't operate with identical function values on both sides of the interval"));

      let between: Parameter = this.divide(_left, _right);
      let betweenValue: boolean = this.function(between);
      if (betweenValue == this.leftValue)
        this.solve(between, this.right, _epsilon, betweenValue, this.rightValue);
      else
        this.solve(this.left, between, _epsilon, this.leftValue, betweenValue);
    }

    public toString(): string {
      let out: string = "";
      out += `left: ${this.left.toString()} -> ${this.leftValue}`;
      out += "\n";
      out += `right: ${this.right.toString()} -> ${this.rightValue}`;
      return out;
    }
  }
}