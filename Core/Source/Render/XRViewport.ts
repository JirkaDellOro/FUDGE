namespace FudgeCore {
  /**
   * @author Valentin Schmidberger, HFU, 2022
   * Different xr session modes available. Could be expand with more modes in the future.
   */
  export enum XR_SESSION_MODE {
    IMMERSIVE_VR = "immersive-vr",
    //IMMERSIVE_AR = "immersive-ar",
    //INLINE = "inline"
  }

  /**
   * Different reference vr-spaces available, creator has to check if the space is supported with its device.
   * Could be expand with more available space types in the future.
   */
  export enum XR_REFERENCE_SPACE {
    VIEWER = "viewer",
    LOCAL = "local",
    // LOCAL_FLOOR = "local-floor",
    // BOUNDED_FLOOR = "bounded-floor",
    // UNBOUNDED = "unbounded"
  }

  /**
   * XRViewport (webXR)-extension of Viewport, to displaying its branch on Head Mounted and AR (not implemted yet) Devices 
   */
  export class XRViewport extends Viewport {
    private static xrViewportInstance: XRViewport = null;
    public vrDevice: ComponentVRDevice = null;
    public session: XRSession = null;
    public referenceSpace: XRReferenceSpace = null;
    private useVRController: boolean = false;
    private crc3: WebGL2RenderingContext = null;

    private poseMtx: Matrix4x4 = new Matrix4x4();
    constructor() {
      super();
      XRViewport.xrViewportInstance = this;
      this.crc3 = RenderWebGL.getRenderingContext();
    }

    /**
     * To retrieve private static instance of xr viewport, readonly.
     */
    public static get default(): XRViewport {
      return this.xrViewportInstance;
    }
    /**
      * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
      */
    public initialize(_name: string, _branch: Node, _cameraXR: ComponentVRDevice /* | ComponentCameraAR*/, _canvas: HTMLCanvasElement): void {
      super.initialize(_name, _branch, _cameraXR, _canvas);
      this.camera = _cameraXR;
    }

    /**
     * The VR Session is initialized here, also VR - Controller are initialized, if boolean is true.
     * Creator has to call FrameRequestXR after this Method to run the viewport in virtual reality.
     */
    public async initializeVR(_vrSessionMode: XR_SESSION_MODE = XR_SESSION_MODE.IMMERSIVE_VR, _vrReferenceSpaceType: XR_REFERENCE_SPACE = XR_REFERENCE_SPACE.LOCAL,
      _vrController: boolean = false): Promise<void> {
      let session: XRSession = await navigator.xr.requestSession(_vrSessionMode);
      this.referenceSpace = await session.requestReferenceSpace(_vrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });      // field of view anschauen was noch geht!

      this.vrDevice = <ComponentVRDevice>this.camera;


      this.initializevrDeviceTransform(this.camera.mtxWorld);
      this.useVRController = _vrController;
      if (_vrController) {
        this.vrDevice.rightCntrl.cmpTransform = new ComponentTransform();
        this.vrDevice.leftCntrl.cmpTransform = new ComponentTransform();
      }

      this.session = session;

      this.calculateTransforms();
    }
    // sets the rotation & position of the inital camera  of cmpVRDevice and adding 180 degree, because the XR Rig is looking in the direction of negative z 
    private initializevrDeviceTransform(_newMtx: Matrix4x4) {
      let newRot: Vector3 = Vector3.SCALE(new Vector3(_newMtx.rotation.x, _newMtx.rotation.y - 180, _newMtx.rotation.z), Math.PI / 180);
      let orientation: Quaternion = new Quaternion();
      orientation.setFromVector3(newRot.x, newRot.y, newRot.z);
      //rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));
      this.camera.mtxPivot.rotateY(180);

      let invTranslation: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(_newMtx.translation, Vector3.ZERO()), -1);
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
      this.vrDevice.mtxLocal.translation = this.camera.mtxWorld.translation;
      this.camera.mtxPivot.translation = Vector3.ZERO();
    }
    /**
     * The AR session could be initialized here. Up till now not implemented. 
     */
    public async initializeAR(_arSessionMode: XRSessionMode = null, _arReferenceSpaceType: XRReferenceSpaceType = null): Promise<void> {
      Debug.error("NOT IMPLEMENTED YET! Check out initializeVR!");
    }

    /**
     * Draw the xr viewport displaying its branch. By default, the transforms in the branch are recalculated first.
     * Pass `false` if calculation was already done for this frame 
     * Called from loop method {@link Loop} again with the xrFrame parameter handover, as soon as FRAME_REQUEST_XR is called from creator.
     */
    public draw(_calculateTransforms: boolean = true, _xrFrame: XRFrame = null): void {
      if (!this.session)
        super.draw(_calculateTransforms);

      if (_xrFrame) {
        super.computeDrawing(_calculateTransforms);
        let pose: XRViewerPose = _xrFrame.getViewerPose(this.referenceSpace);
        let glLayer: XRWebGLLayer = this.session.renderState.baseLayer;
        Render.resetFrameBuffer(glLayer.framebuffer);
        Render.clear(this.camera.clrBackground);

        this.poseMtx.set(pose.transform.matrix);
        this.poseMtx.rotateY(180);
        this.vrDevice.mtxLocal.set(this.poseMtx);

        if (pose) {
          for (let view of pose.views) {
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (this.useVRController)
              this.setControllerConfigs(_xrFrame);
            this.camera.mtxProjection.set(view.projectionMatrix);
            this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);


            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
              Render.draw(this.camera);
            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.NONE) {
              Physics.draw(this.camera, this.physicsDebugMode);
            }
          }
          Render.setRenderRectangle(Render.getRenderRectangle());
        }
      }
    }
    //Sets controller matrices and thumbsticks movements.
    private setControllerConfigs(_xrFrame: XRFrame): void {
      if (_xrFrame) {
        if (XRViewport.default.session.inputSources.length > 0) {
          XRViewport.default.session.inputSources.forEach(controller => {
            try {
              switch (controller.handedness) {
                case ("right"):
                  this.vrDevice.rightCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                  if (!this.vrDevice.rightCntrl.gamePad)
                    this.vrDevice.rightCntrl.gamePad = controller.gamepad;
                  else {
                    this.vrDevice.rightCntrl.thumbstickX = controller.gamepad.axes[2];
                    this.vrDevice.rightCntrl.thumbstickY = controller.gamepad.axes[3];
                  }
                  break;
                case ("left"):
                  this.vrDevice.leftCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);

                  if (!this.vrDevice.leftCntrl.gamePad)
                    this.vrDevice.leftCntrl.gamePad = controller.gamepad;
                  else {
                    this.vrDevice.leftCntrl.thumbstickX = controller.gamepad.axes[2];
                    this.vrDevice.leftCntrl.thumbstickY = controller.gamepad.axes[3];
                  }
                  break;
              }
            } catch (e: unknown) {
              Debug.info("Input Sources Error: " + e);
            }
          });
        }
      }
    }
  }
}

