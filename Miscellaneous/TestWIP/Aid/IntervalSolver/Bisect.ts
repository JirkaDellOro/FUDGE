/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>

namespace IntervalSolver {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  let arInSoNumber: ƒAid.ArithBisection<number, number> = new ƒAid.ArithBisection<number, number>(
    (_num: number): boolean => { return _num < 3; },
    (_left: number, _right: number): number => { return (_left + _right) / 2; },
    (_left: number, _right: number, _epsilon: number): boolean => { return Math.abs(_right - _left) < _epsilon; }
  );

  arInSoNumber.solve(0, 10, 0.001);
  console.log(arInSoNumber.toString());

  let rect: ƒ.Rectangle = new ƒ.Rectangle(10, 10, 100, 100);
  let arInSoV2: ƒAid.ArithBisection<ƒ.Vector2, number> = new ƒAid.ArithBisection<ƒ.Vector2, number>(
    (_v: ƒ.Vector2): boolean => { return rect.isInside(_v); },
    (_left: ƒ.Vector2, _right: ƒ.Vector2): ƒ.Vector2 => {
      return ƒ.Vector2.SCALE(ƒ.Vector2.SUM(_left, _right), 0.5);
    },
    (_left: ƒ.Vector2, _right: ƒ.Vector2, _epsilon: number): boolean => {
      return (ƒ.Vector2.DIFFERENCE(_right, _left).magnitudeSquared < _epsilon * _epsilon);
    }
  );

  arInSoV2.solve(ƒ.Vector2.ONE(20), ƒ.Vector2.ZERO(), 0.001);
  console.log(arInSoV2.toString());
}