namespace FudgeCore {
  export class XRViewport extends Viewport {
    //static instance of Viewport 
    private static xrViewportInstance: XRViewport = null;

    public xr: XR = new XR();

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

    // the xrSession is initialized here, after xrSession is setted and FrameRequestXR is called from user, the XRViewport is ready to go.
    public async initializeXR(_xrSessionMode: XRSessionMode = "immersive-vr", _xrReferenceSpaceType: XRReferenceSpaceType = "local", _useController: boolean = false): Promise<void> {

      let session: XRSession = await navigator.xr.requestSession(_xrSessionMode);
      this.xr.xrReferenceSpace = await session.requestReferenceSpace(_xrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3) });
      this.useController = _useController;
      if (_useController) {
        this.xr.rightController = new XRController();
        this.xr.leftController = new XRController();
      }
      this.xr.xrSession = session;
    }

    //override viewport draw method for xr - draws normal as long as initializeXR is not called 
    public draw(_calculateTransforms: boolean = true): void {
      if (this.xr.xrSession == null) {
        super.draw(_calculateTransforms);
      }
    }

    //real draw method in XR Mode - called from Loop Class over static instance of this class.
    public drawXR(_xrFrame: XRFrame = null): void {
      if (!_xrFrame) {
        super.draw(true);
      } else {
        super.calculateDrawing(true);

        let glLayer: XRWebGLLayer = this.xr.xrSession.renderState.baseLayer;
        let pose: XRViewerPose = _xrFrame.getViewerPose(this.xr.xrReferenceSpace);
        this.crc3.bindFramebuffer(this.crc3.FRAMEBUFFER, glLayer.framebuffer);

        if (pose) {
          for (let view of pose.views) {
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (this.useController)
              this.xr.setController(_xrFrame);

            //------------------------------------------
            //just for testing porpuses, rays get only on one screen if they are not setted here // have to investigate why
            if (this.xr.rightController.isRayHitInfo)
              this.xr.rightController.setRay();
            if (this.xr.leftController.isRayHitInfo)
              this.xr.leftController.setRay();
            //------------------------------------------

            this.camera.mtxPivot.set(view.transform.matrix);
            this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);
            this.camera.mtxProjection.set(view.projectionMatrix);

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

