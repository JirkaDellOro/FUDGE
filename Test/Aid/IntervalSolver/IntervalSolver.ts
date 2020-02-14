/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>

namespace IntervalSolver {
  import ƒAid = FudgeAid;

  let intervalSolver: ƒAid.ArithIntervalSolver<number> = new ƒAid.ArithIntervalSolver<number>(
    (_num: number): boolean => { return _num < 3; },
    (_left: number, _right: number): number => { return (_left + _right) / 2; },
    (_left: number, _right: number, _epsilon: number): boolean => { return Math.abs(_right - _left) < _epsilon; }
  );

  intervalSolver.solve(0, 10, 0.1);
  console.log(intervalSolver);
}