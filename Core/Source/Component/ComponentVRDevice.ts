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
    public set translation(_translation: Vector3) {
      let translation: Vector3 = _translation.clone;
      translation.subtract(this.#mtxLocal.translation);
      translation.negate();
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(translation));
      this.#mtxLocal.translation = _translation;
      Recycler.store(translation);
    }

    /**
     * Sets Vector3 Rotation of the reference space.
     */
    public set rotation(_rotation: Vector3) {
      let rotation: Vector3 = _rotation.clone; 
      rotation.subtract(this.#mtxLocal.rotation);
      rotation.negate();
      let orientation: Quaternion = new Quaternion();
      orientation.eulerAngles = rotation;
      // Rotation needs to be set in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
      // set xr - rig back to origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.#mtxLocal.translation, Vector3.ZERO())));
      // rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), orientation));
      // set xr - rig back to last position 
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.#mtxLocal.translation)));
      this.#mtxLocal.rotation = _rotation;
      Recycler.store(rotation);
    }

    /**
     * Adds a Vector3 in Position of the reference space.
     */
    public translate(_by: Vector3): void {
      let translation: Vector3 = _by.clone;
      translation.transform(this.#mtxLocal.quaternion);
      translation.negate();
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(translation));
      this.#mtxLocal.translate(_by);
      Recycler.store(translation);
    }

    /**
     * Adds a Vector3 in Rotation of the reference space.
     */
    public rotate(_by: Vector3): void {
      let rotation: Vector3 = _by.clone.negate(); 
      let orientation: Quaternion = new Quaternion();
      orientation.eulerAngles = rotation;
      // Rotation needs to be added in the Origin (0,0,0), otherwise the XR-Rig gets rotated around the origin. 
      // set xr - rig back to origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(this.#mtxLocal.translation, Vector3.ZERO())));
      // rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), orientation));
      // set xr - rig back to last position 
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.DIFFERENCE(Vector3.ZERO(), this.#mtxLocal.translation)));
      this.#mtxLocal.rotate(_by);
      Recycler.store(rotation);
    }

    private getMtxLocalFromCmpTransform(): void {
      this.#mtxLocal = this.node.mtxLocal;
    }
  }
}

