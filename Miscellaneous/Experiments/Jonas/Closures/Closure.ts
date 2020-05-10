namespace Closure {

  let closure: Function = createClosureLinear(2, 3, 4, 5);
  let y: number = closure(2.5);
  console.log(y);

  function createClosureLinear(_xStart: number = 0, _xEnd: number = 1, _yStart: number = 0, _yEnd: number = 1): Function {
    let f: Function = function (_x: number): number {
      // console.log(_xStart, _xEnd, _yStart, _yEnd);
      let y: number = _yStart + (_x - _xStart) * (_yEnd - _yStart) / (_xEnd - _xStart);
      return y;
    };
    return f;
  }
}