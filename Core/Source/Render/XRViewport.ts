namespace FudgeCore {
  export class XRViewport extends Viewport {
    //static instance of Viewport 
    private static xrViewportInstance: XRViewport = null;

    public xrTool: XRTool = new XRTool();
    public isActive: boolean = false;
    private useController: boolean = false;

    public static get XRViewportInstance(): XRViewport {
      if (!this.xrViewportInstance) return null;
      else return this.xrViewportInstance;
    }

    public static SETXRFRAME(_xrFrame: XRFrame): void {
      return this.xrViewportInstance.drawXR(_xrFrame);
    }

    constructor() {
      super();
      XRViewport.xrViewportInstance = this;
    }

    // the xrSession is initialized here, after xrSession is setted and FrameRequestXR is called from user, the XRViewport is ready to go.
    public async initializeXR(_xrSessionMode: XRSessionMode, _xrReferenceSpaceType: XRReferenceSpaceType, _useController: boolean): Promise<void> {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let session: XRSession = await navigator.xr.requestSession(_xrSessionMode);
      this.xrTool.xrReferenceSpace = await session.requestReferenceSpace(_xrReferenceSpaceType);
      await crc3.makeXRCompatible();
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, crc3) });
      this.useController = _useController;
      if (_useController) {
        this.xrTool.rightController = new XRController();
        this.xrTool.leftController = new XRController();
      }
      this.xrTool.xrSession = session;
      this.isActive = true;
    }

    //override viewport draw method for xr - draws normal as long as initializeXR is not called 
    public draw(_calculateTransforms: boolean = true): void {
      if (this.xrTool.xrSession == null) {
        super.draw(_calculateTransforms);
      }
    }

    //real draw method in XR Mode - called from Loop Class over static instance of this class.
    public drawXR(_xrFrame: XRFrame = null): void {
      if (!_xrFrame) {
        super.draw(true);
      } else {
        let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

        let glLayer: XRWebGLLayer = this.xrTool.xrSession.renderState.baseLayer;
        let pose: XRViewerPose = _xrFrame.getViewerPose(this.xrTool.xrReferenceSpace);
        if (pose) {
          super.calculateDrawing(true);
          for (let view of pose.views) {
            this.camera.resetWorldToView();
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

            if (this.useController)
              this.xrTool.setController(_xrFrame);
            //just for testing porpuses, rays get only on one screen if they are not setted here // have to investigate why
            if (this.xrTool.rightController.isRayHitInfo)
              this.xrTool.rightController.setRay();
            if (this.xrTool.leftController.isRayHitInfo)
              this.xrTool.leftController.setRay();

            this.camera.mtxPivot.set(view.transform.matrix);
            this.camera.mtxCameraInverse.set(view.transform.inverse.matrix);
            this.camera.mtxProjection.set(view.projectionMatrix);

            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.NONE) {
              Physics.draw(this.camera, this.physicsDebugMode);
            }
            if (this.physicsDebugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY) {
              Render.draw(this.camera);
            }
          }
        }
      }
    }
  }
}

