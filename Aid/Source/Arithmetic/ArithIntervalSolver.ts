/// <reference types="../../../Core/Build/FudgeCore"/>

namespace FudgeAid {
  export class ArithIntervalSolver<Interval, Epsilon> {
    public left: Interval;
    public right: Interval;
    public leftValue: boolean;
    public rightValue: boolean;
    private function: (_t: Interval) => boolean;
    private divide: (_left: Interval, _right: Interval) => Interval;
    private isSmaller: (_left: Interval, _right: Interval, _epsilon: Epsilon) => boolean;

    constructor(
      _function: (_t: Interval) => boolean,
      _divide: (_left: Interval, _right: Interval) => Interval,
      _isSmaller: (_left: Interval, _right: Interval, _epsilon: Epsilon) => boolean) {
      this.function = _function;
      this.divide = _divide;
      this.isSmaller = _isSmaller;
    }

    public solve(_left: Interval, _right: Interval, _epsilon: Epsilon, _leftValue: boolean = undefined, _rightValue: boolean = undefined): void {
      this.left = _left;
      this.leftValue = _leftValue || this.function(_left);
      this.right = _right;
      this.rightValue = _rightValue || this.function(_right);

      if (this.isSmaller(_left, _right, _epsilon))
        return;

      let between: Interval = this.divide(_left, _right);
      let betweenValue: boolean = this.function(between);
      if (betweenValue == _leftValue)
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