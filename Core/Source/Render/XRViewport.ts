namespace FudgeCore {
  /**
   * @author Valentin Schmidberger, HFU, 2022
   * Could be expand with more available modes in the future, until now #immersive session is supported.
   */
  export enum VR_SESSION_MODE {
    IMMERSIVE_VR = "immersive-vr",
  }

  /**
   * Different reference vr-spaces available, user has to check if the space is supported with its device.
   * Could be expand with more available space types in the future, until now #viewer and #local space types are supported.
   */
  export enum VR_REFERENCE_SPACE {
    VIEWER = "viewer",
    LOCAL = "local",
  }

  /**
   * XRViewport (webXR)-extension of Viewport, to display FUDGE content on Head Mounted and AR(not implemted yet) Devices 
   */
  export class XRViewport extends Viewport {
    private static xrViewportInstance: XRViewport = null;

    public vr: VR = new VR();

    private useController: boolean = false;
    private crc3: WebGL2RenderingContext = null;
    private xrCamera: ComponentCamera = null;

    constructor() {
      super();
      XRViewport.xrViewportInstance = this;
      this.crc3 = RenderWebGL.getRenderingContext();
      this.xrCamera = new ComponentCamera();
    }

    /**
     * To retrieve private static Instance of Viewport, just needed for calling the drawXR Method in {@link Loop}
     */
    public static get default(): XRViewport {
      return this.xrViewportInstance;
    }

    /**
     * The VR Session is initialized here, after XR-Session is setted and FrameRequestXR is called from user, the XRViewport is ready to draw.
     * Also VR - Controller are initialized, if user sets vrController-boolean.
     */
    public async initializeVR(_vrSessionMode: VR_SESSION_MODE = VR_SESSION_MODE.IMMERSIVE_VR, _vrReferenceSpaceType: VR_REFERENCE_SPACE = VR_REFERENCE_SPACE.LOCAL, _vrController: boolean = false): Promise<void> {

      let session: XRSession = await navigator.xr.requestSession(_vrSessionMode);
      this.vr.referenceSpace = await session.requestReferenceSpace(_vrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });
      this.useController = _vrController;
      if (_vrController) {
        this.vr.rController.cntrlTransform = new ComponentTransform();
        this.vr.lController.cntrlTransform = new ComponentTransform();
      }
      this.vr.session = session;
      this.calculateTransforms();
      console.log(this.camera.mtxWorld.toString());
      this.xrCamera.mtxPivot = this.camera.mtxWorld;
      this.xrCamera.clrBackground = this.camera.clrBackground;
      this.camera = this.xrCamera;
    }

    /**
     * The AR Session could be initialized here. Up till now not implemented. 
     */
    public async initializeAR(_xrSessionMode: XRSessionMode = null, _xrReferenceSpaceType: XRReferenceSpaceType = null): Promise<void> {
      Debug.error("NOT IMPLEMENTED YET! Check out initializeVR!");
    }

    /**
     * Real draw method in XR Mode - called from Loop Method {@link Loop} with a static reference of this class.
     */
    public draw(_calculateTransforms: boolean = true, _xrFrame: XRFrame = null): void {
      if (!this.vr.session)
        super.draw(_calculateTransforms);

      if (_xrFrame) {
        super.computeDrawing(_calculateTransforms);
        let pose: XRViewerPose = _xrFrame.getViewerPose(this.vr.referenceSpace);
        let glLayer: XRWebGLLayer = this.vr.session.renderState.baseLayer;

        Render.resetFrameBuffer(glLayer.framebuffer);
        Render.clear(this.camera.clrBackground);
        if (pose) {
          for (let view of pose.views) {
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);


            if (this.useController)
              this.vr.setController(_xrFrame);

            this.camera.mtxProjection.set(view.projectionMatrix);
            this.camera.mtxPivot.set(view.transform.matrix);
            this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);



            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
              Render.draw(this.camera);
            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.NONE) {
              Physics.draw(this.camera, this.physicsDebugMode);
            }
          }
        }
      }
    }
  }
}

