namespace FudgeCore {
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

    // the xrSession is initialized here, after xrSession is setted and FrameRequestXR is called from user, the XRViewport is ready to go.
    public async initializeVR(_xrSessionMode: XRSessionMode = "immersive-vr", _xrReferenceSpaceType: XRReferenceSpaceType = "local", _xrController: boolean = false): Promise<void> {

      let session: XRSession = await navigator.xr.requestSession(_xrSessionMode);
      this.vr.xrReferenceSpace = await session.requestReferenceSpace(_xrReferenceSpaceType);
      await this.crc3.makeXRCompatible();
      let nativeScaleFactor = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });
      this.useController = _xrController;
      if (_xrController) {
        this.vr.rightController = new ComponentTransform();
        this.vr.leftController = new ComponentTransform();
      }
      this.vr.xrSession = session;
    }

    //override viewport draw method for xr - draws normal as long as initializeXR is not called 
    public draw(_calculateTransforms: boolean = true): void {
      if (this.vr.xrSession == null) {
        super.draw(_calculateTransforms);
      }
    }

    //real draw method in XR Mode - called from Loop Class over static instance of this class.
    public drawVR(_xrFrame: XRFrame = null): void {
      if (!_xrFrame) {
        super.draw(true);
      } else {
        let pose: XRViewerPose = _xrFrame.getViewerPose(this.vr.xrReferenceSpace);
        let glLayer: XRWebGLLayer = this.vr.xrSession.renderState.baseLayer;

        this.crc3.bindFramebuffer(this.crc3.FRAMEBUFFER, glLayer.framebuffer);
        super.calculateTransforms();

        Render.clear(this.camera.clrBackground);

        if (pose) {
          for (let view of pose.views) {
            let viewport: globalThis.XRViewport = glLayer.getViewport(view);
            // this.crc3.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
            this.adjustFramesVR(viewport);
            this.adjustCameraVR(viewport);

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
            // this.canvas.getContext("2d").drawImage(
            //   Render.getCanvas(),
            //   viewport.x, viewport.y, viewport.width, viewport.height,
            //   viewport.x, viewport.y, viewport.width, viewport.height
            // );
          }
        }
      }
    }
    private adjustFramesVR(_viewport: globalThis.XRViewport): void {
      // get the rectangle of the canvas area as displayed (consider css)
      let rectClient: Rectangle = this.getClientRectangle();
      // adjust the canvas size according to the given framing applied to client
      let rectCanvas: Rectangle = this.frameClientToCanvas.getRect(rectClient);
      Render.getCanvas().width = rectCanvas.width;
      Render.getCanvas().height = rectCanvas.height;
      Render.setRenderRectangle(new Rectangle(_viewport.x, _viewport.y, _viewport.width, _viewport.height));
    }

    private adjustCameraVR(_viewport: globalThis.XRViewport): void {
      this.camera.projectCentral(
        _viewport.width / _viewport.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar()
      );
    }
  }
}

