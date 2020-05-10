"use strict";
var Closure;
(function (Closure) {
    let closure = createClosureLinear(2, 3, 4, 5);
    let y = closure(2.5);
    console.log(y);
    function createClosureLinear(_xStart = 0, _xEnd = 1, _yStart = 0, _yEnd = 1) {
        let f = function (_x) {
            // console.log(_xStart, _xEnd, _yStart, _yEnd);
            let y = _yStart + (_x - _xStart) * (_yEnd - _yStart) / (_xEnd - _xStart);
            return y;
        };
        return f;
    }
})(Closure || (Closure = {}));
//# sourceMappingURL=Closure.js.map