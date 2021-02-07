/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
var IntervalSolver;
/// <reference types="../../../Core/Build/FudgeCore"/>
/// <reference types="../../../Aid/Build/FudgeAid"/>
(function (IntervalSolver) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    let arInSoNumber = new ƒAid.ArithBisection((_num) => { return _num < 3; }, (_left, _right) => { return (_left + _right) / 2; }, (_left, _right, _epsilon) => { return Math.abs(_right - _left) < _epsilon; });
    arInSoNumber.solve(0, 10, 0.001);
    console.log(arInSoNumber.toString());
    let rect = new ƒ.Rectangle(10, 10, 100, 100);
    let arInSoV2 = new ƒAid.ArithBisection((_v) => { return rect.isInside(_v); }, (_left, _right) => {
        return ƒ.Vector2.SCALE(ƒ.Vector2.SUM(_left, _right), 0.5);
    }, (_left, _right, _epsilon) => {
        return (ƒ.Vector2.DIFFERENCE(_right, _left).magnitudeSquared < _epsilon * _epsilon);
    });
    arInSoV2.solve(ƒ.Vector2.ONE(20), ƒ.Vector2.ZERO(), 0.001);
    console.log(arInSoV2.toString());
})(IntervalSolver || (IntervalSolver = {}));
//# sourceMappingURL=Bisect.js.map