"use strict";
var ArrayPerformance;
(function (ArrayPerformance) {
    let count = 0;
    // let standard: number[] = new Array();
    let standard = new ArrayPerformance.ArrayRecycable();
    window.requestAnimationFrame(updateStandard);
    function updateStandard() {
        // console.log(count);
        standard.reset();
        for (let i = 0; i < 10000; i++)
            standard.push(count + i);
        count++;
        window.requestAnimationFrame(updateStandard);
    }
})(ArrayPerformance || (ArrayPerformance = {}));
