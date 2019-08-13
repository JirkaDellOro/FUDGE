declare var createjs: any, lib: any, stage: any, exportRoot: any, canvas: any, init: any;
console.log("ich bin auch da");

function init_main(_event: Event): void {
    init();
    let s: any = new lib.Segment();
    stage.addChild(s);
    s.y = 60;
    s.x = 200;
    s.rotation = 100;

    s = new lib.Ship();
    stage.addChild(s);
    s.setTransform(100, 200, 1.5, 1.5, 90, 0, 0, 0, 0);
    //s.rotation = 30;
}