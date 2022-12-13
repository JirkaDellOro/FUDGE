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



    //real draw method in XR Mode - called from Loop Class over static instance of this class.
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
    // private calculateTransformsVR(_viewport: globalThis.XRViewport): void {
    //   let mtxRoot: Matrix4x4 = Matrix4x4.IDENTITY();
    //   if (this.getBranch().getParent())
    //     mtxRoot = this.getBranch().getParent().mtxWorld;
    //   this.dispatchEvent(new Event(EVENT.RENDER_PREPARE_START));
    //   this.adjustFramesVR(_viewport);
    //   Render.prepare(this.getBranch(), null, mtxRoot);
    //   this.dispatchEvent(new Event(EVENT.RENDER_PREPARE_END));
    //   this.componentsPick = Render.componentsPick;
    // }
    // private adjustFramesVR(_viewport: globalThis.XRViewport): void {
    //   // get the rectangle of the canvas area as displayed (consider css)
    //   let rectClient: Rectangle = this.getClientRectangle();
    //   // adjust the canvas size according to the given framing applied to client
    //   let rectCanvas: Rectangle = this.frameClientToCanvas.getRect(rectClient);
    //   Render.getCanvas().width = rectCanvas.width;
    //   Render.getCanvas().height = rectCanvas.height;

    //   let rectTemp: Rectangle;
    //   // adjust the destination area on the target-canvas to render to by applying the framing to canvas
    //   rectTemp = this.frameCanvasToDestination.getRect(rectCanvas);
    //   this.rectDestination.copy(rectTemp);
    //   Recycler.store(rectTemp);
    //   // adjust the area on the source-canvas to render from by applying the framing to destination area
    //   rectTemp = this.frameDestinationToSource.getRect(this.rectDestination);
    //   this.rectSource.copy(rectTemp);
    //   Recycler.store(rectTemp);

    //   // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
    //   this.rectSource.x = this.rectSource.y = 0;
    //   // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport. For now, it's always adjusted to the current viewport
    //   let rectRender: Rectangle = this.frameSourceToRender.getRect(this.rectSource);
    //   Render.setRenderRectangle(new Rectangle(_viewport.x, _viewport.y, _viewport.width, _viewport.height));
    //   // no more transformation after this for now, offscreen canvas and render-viewport have the same size
    //   Render.setCanvasSize(rectRender.width, rectRender.height);

    //   Recycler.store(rectClient);
    //   Recycler.store(rectCanvas);
    //   Recycler.store(rectRender);

    //   // // get the rectangle of the canvas area as displayed (consider css)
    //   // let rectClient: Rectangle = this.getClientRectangle();
    //   // // adjust the canvas size according to the given framing applied to client
    //   // let rectCanvas: Rectangle = this.frameClientToCanvas.getRect(rectClient);
    //   // Render.getCanvas().width = rectCanvas.width;
    //   // Render.getCanvas().height = rectCanvas.height;
    //   // Render.setRenderRectangle(new Rectangle(_viewport.x, _viewport.y, _viewport.width, _viewport.height));
    // }

    // private adjustCameraVR(_viewport: globalThis.XRViewport): void {
    //   this.camera.projectCentral(
    //     _viewport.width / _viewport.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar()
    //   );
    // }
  }
}

