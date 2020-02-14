/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>

namespace FudgeAid {
  export class ArithIntervalSolver<T> {
    public left: T;
    public right: T;
    public leftValue: boolean;
    public rightValue: boolean;
    private function: (_t: T) => boolean;
    private divide: (_left: T, _right: T) => T;
    private isSmaller: (_left: T, _right: T, _epsilon: T) => boolean;

    constructor(
      _function: (_t: T) => boolean,
      _divide: (_left: T, _right: T) => T,
      _isSmaller: (_left: T, _right: T, _epsilon: T) => boolean) {
      this.function = _function;
      this.divide = _divide;
      this.isSmaller = _isSmaller;
    }

    public solve(_left: T, _right: T, _epsilon: T, _leftValue: boolean = undefined, _rightValue: boolean = undefined): void {
      this.left = _left;
      this.leftValue = _leftValue || this.function(_left);
      this.right = _right;
      this.rightValue = _rightValue || this.function(_right);

      if (this.isSmaller(_left, _right, _epsilon))
        return;

      let between: T = this.divide(_left, _right);
      let betweenValue: boolean = this.function(between);
      if (betweenValue == _leftValue)
        this.solve(between, this.right, _epsilon, betweenValue, this.rightValue);
      else
        this.solve(this.left, between, _epsilon, this.leftValue, betweenValue);
    }
  }
}