namespace FudgeCore {

  /**
   * Describes a VR Controller and its capabilities.
   */
  export class VRController {
    public cmpTransform: ComponentTransform = null;
    public gamePad: Gamepad = null;
    public thumbstickX: number = null;
    public thumbstickY: number = null;
  }

  /**
   * VR Component Class, for Session Management, Controller Management and Reference Space Management. 
   * @author Valentin Schmidberger, HFU, 2022
   */
  export class ComponentVRDevice extends ComponentCamera {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentVRDevice);
    public rightCntrl: VRController = new VRController();
    public leftCntrl: VRController = new VRController();

    #mtxLocal: Matrix4x4;

    public constructor() {
      super();
      this.addEventListener(EVENT.COMPONENT_ADD, this.getMtxLocalFromCmpTransform);
    }

    /**
     * Returns the actual matrix of the vr - device.
     * Creators should use this for readonly purposes.  
     */
    public get mtxLocal(): Matrix4x4 {
      return this.#mtxLocal;
    }

    /**
     * Sets a Vector3 as Position of the reference space.
     */
    public set translation(_newPos: Vector3) {
      let invTranslation: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(_newPos, this.#mtxLocal.translation), -1);
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
      this.#mtxLocal.translation = _newPos;
    }

    /**
     * Sets Vector3 Rotation of the reference space.
     * Rotation needs to be set in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
     */
    public set rotation(_newRot: Vector3) {
      let newRot: Vector3 = Vector3.SCALE(Vector3.SCALE(Vector3.SUM(_newRot, this.#mtxLocal.rotation), -1), Math.PI / 180);

      let orientation: Quaternion = new Quaternion();
      orientation.eulerAngles = newRot;
      //set xr - rig back to origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.#mtxLocal.translation, Vector3.ZERO())));
      //rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
      //set xr - rig back to last position 
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.#mtxLocal.translation)));
      this.#mtxLocal.rotation = Vector3.SCALE(_newRot, -1);
    }

    /**
     * Adds a Vector3 in Position of the reference space.
     */
    public translate(_by: Vector3): void {
      let invTranslation: Vector3 = Vector3.SCALE(_by, -1);
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
      this.#mtxLocal.translate(_by);
    }

    /**
     * Adds a Vector3 in Rotation of the reference space.
     * Rotation needs to be added in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
     */
    public rotate(_by: Vector3): void {
      let rotAmount: Vector3 = Vector3.SCALE(Vector3.SCALE(_by, -1), Math.PI / 180);

      let orientation: Quaternion = new Quaternion();
      orientation.eulerAngles = rotAmount;
      //set xr - rig back to origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.#mtxLocal.translation, Vector3.ZERO())));
      //rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
      //set xr - rig back to last position 
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.#mtxLocal.translation)));
      this.#mtxLocal.rotate(Vector3.SCALE(_by, -1));
    }

    private getMtxLocalFromCmpTransform(): void {
      this.#mtxLocal = this.node.getComponent(ComponentTransform).mtxLocal;

    }
  }
}

