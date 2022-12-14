namespace FudgeCore {
  export enum VRSESSIONMODE {
    IMMERSIVEVR = "immersive-vr",
  }
  export enum VRREFERENCESPACE {
    VIEWER = "viewer",
    LOCAL = "local",
    LOCALFLOOR = "local-floor",
    BOUNDEDFLOOR = "bounded-floor",
    UNBOUNDED = "unbounded"
  }
  export class XRViewport extends Viewport {
    //static instance of Viewport 
    private static xrViewportInstance: XRViewport = null;

    public vr: VR = new VR();

    private useController: boolean = false;
    private crc3: WebGL2RenderingContext = null;

    // sets static reference of non static class :-0
    public static get default(): XRViewport {
      return this.xrViewportInstance;
    }

    constructor() {
      super();
      XRViewport.xrViewportInstance = this;
      this.crc3 = RenderWebGL.getRenderingContext();
    }

    // the vrSession is initialized here, after xrSession is setted and FrameRequestXR is called from user, the XRViewport is ready to go.
    public async initializeVR(_xrReferenceSpaceType: XRReferenceSpaceType = VRREFERENCESPACE.LOCAL, _xrController: boolean = false): Promise<void> {
      let session: XRSession = await navigator.xr.requestSession(VRSESSIONMODE.IMMERSIVEVR);
      this.vr.referenceSpace = await session.requestReferenceSpace(_xrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });
      this.useController = _xrController;
      if (_xrController) {
        this.vr.rController.cntrlTransform = new ComponentTransform();
        this.vr.lController.cntrlTransform = new ComponentTransform();
      }
      this.vr.session = session;
    }
    public async initializeAR(_xrSessionMode: XRSessionMode = null, _xrReferenceSpaceType: XRReferenceSpaceType = null,): Promise<void> {
      console.log("NOT IMPLEMENTED YET");
    }


    //real draw method in XR Mode - called from Loop Class over static instance of this class.
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

