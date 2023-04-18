namespace FudgeCore {
  /**
   * Makes the node face the camera when rendering, respecting restrictions for rotation around specific axis
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentFaceCamera extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentFaceCamera);

    public upLocal: boolean = true;
    public up: Vector3 = Vector3.Y(1);
    public restrict: boolean = false;

    constructor() {
      super();
      this.singleton = true;
    }
  }
}