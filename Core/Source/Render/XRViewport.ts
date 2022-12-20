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

    public vr: VR = null;

    public session: XRSession = null;
    public referenceSpace: XRReferenceSpace = null;
    private useVRController: boolean = false;
    private crc3: WebGL2RenderingContext = null;

    private poseDevice: Matrix4x4 = new Matrix4x4();
    private deviceTransform: ComponentTransform = null;

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
    public initialize(_name: string, _branch: Node, _cameraVR: ComponentCameraVR, _canvas: HTMLCanvasElement): void {

      super.initialize(_name, _branch, _cameraVR, _canvas);
      let deviceCamera: ComponentCamera = new ComponentCamera();
      deviceCamera.mtxPivot = _cameraVR.mtxWorld;
      deviceCamera.clrBackground = _cameraVR.clrBackground;
      this.deviceTransform = _cameraVR.node.getComponent(ComponentTransform);
      this.camera = deviceCamera;
    }

    /**
     * The VR Session is initialized here, also VR - Controller are initialized, if boolean is true.
     * Creator has to call FrameRequestXR after this Method to run the viewport in virtual reality.
     */
    public async initializeVR(_vrSessionMode: XR_SESSION_MODE = XR_SESSION_MODE.IMMERSIVE_VR, _vrReferenceSpaceType: XR_REFERENCE_SPACE = XR_REFERENCE_SPACE.LOCAL, _vrController: boolean = false): Promise<void> {
      let session: XRSession = await navigator.xr.requestSession(_vrSessionMode);
      this.referenceSpace = await session.requestReferenceSpace(_vrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });      // field of view anschauen was noch geht!

      this.initializeInternalDeviceTransform(this.camera.mtxPivot);

      this.session = session;

      this.vr = new VR();
      this.vr.deviceTransform = this.deviceTransform;

      this.useVRController = _vrController;
      if (_vrController) {
        this.vr.rightCntrl.cmpTransform = new ComponentTransform();
        this.vr.leftCntrl.cmpTransform = new ComponentTransform();
      }


      // sets the rotation & position of the inital viewport camera and adding 180 degree, because the XR Rig is looking in the direction of negative z 
      this.calculateTransforms();
    }
    private initializeInternalDeviceTransform(_newMtx: Matrix4x4) {
      let newRot: Vector3 = Vector3.SCALE(new Vector3(_newMtx.rotation.x, _newMtx.rotation.y - 180, _newMtx.rotation.z), Math.PI / 180);

      let orientation: Quaternion = new Quaternion();
      orientation.setFromVector3(newRot.x, newRot.y, newRot.z);
      //set xr - rig back to origin
      //rotate xr rig in origin
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(Vector3.ZERO(), <DOMPointInit><unknown>orientation));

      let invTranslation: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(_newMtx.translation, this.deviceTransform.mtxLocal.translation), -1);
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invTranslation));
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

        this.poseDevice.set(pose.transform.matrix);

        this.vr.deviceTransform.mtxLocal.translation = this.poseDevice.translation;
        this.vr.deviceTransform.mtxLocal.rotation = new Vector3(this.poseDevice.rotation.x, this.poseDevice.rotation.y - 180, this.poseDevice.rotation.z);

        if (pose) {
          for (let view of pose.views) {
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (this.useVRController)
              this.vr.setControllerConfigs(_xrFrame);

            this.camera.mtxPivot.set(view.transform.matrix);
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
  }
}

