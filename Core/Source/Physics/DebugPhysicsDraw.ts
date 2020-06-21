namespace FudgeCore {
  export class PhysicsDebugDraw { // extends OIMO.DebugDraw { //can't extend from OIMO.DebugDraw since it might or might not be loaded. So it needs to be structured like DebugDraw, to be cast as one.
    // needs to get Oimo Debug Draw informations and such and give em to the Fudge Draw buffer
    public oimoDebugDraw: OIMO.DebugDraw;
    public style: OIMO.DebugDrawStyle;
    public drawAabbs: boolean = true;
    public drawJoints: boolean = true;

    constructor() {
      this.style = new OIMO.DebugDrawStyle();
      this.oimoDebugDraw = new OIMO.DebugDraw();

      this.initializeOverride();
    }

    private initializeOverride() {
      OIMO.DebugDraw.prototype.point = function (v: OIMO.Vec3, color: OIMO.Vec3) {
        //Initialize Buffers, Bind Buffers and make the draw call
      }

      OIMO.DebugDraw.prototype.line = function (v1: OIMO.Vec3, v2: OIMO.Vec3, color: OIMO.Vec3) {

      }

      OIMO.DebugDraw.prototype.triangle = function (v1: OIMO.Vec3, v2: OIMO.Vec3, v3: OIMO.Vec3, n1: OIMO.Vec3, n2: OIMO.Vec3, n3: OIMO.Vec3, color: OIMO.Vec3) {

      }

    }


  }

}

