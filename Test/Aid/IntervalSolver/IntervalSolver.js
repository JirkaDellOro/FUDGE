/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
var IntervalSolver;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
(function (IntervalSolver) {
    var ƒAid = FudgeAid;
    let intervalSolver = new ƒAid.ArithIntervalSolver((_num) => { return _num < 3; }, (_left, _right) => { return (_left + _right) / 2; }, (_left, _right, _epsilon) => { return Math.abs(_right - _left) < _epsilon; });
    intervalSolver.solve(0, 10, 0.1);
    console.log(intervalSolver);
})(IntervalSolver || (IntervalSolver = {}));
//# sourceMappingURL=IntervalSolver.js.map