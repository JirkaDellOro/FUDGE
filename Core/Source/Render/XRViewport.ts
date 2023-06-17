namespace FudgeCore {
  /**
   * Different xr session modes available. Could be expand with more modes in the future.
   * @authors Valentin Schmidberger, HFU, 2022 | Jonas Plotzky, HFU, 2023
   */
  export enum XR_SESSION_MODE {
    IMMERSIVE_VR = "immersive-vr"
    //IMMERSIVE_AR = "immersive-ar",
    //INLINE = "inline"
  }

  /**
   * Different reference vr-spaces available, creator has to check if the space is supported with its device.
   * Could be expand with more available space types in the future.
   */
  export enum XR_REFERENCE_SPACE {
    VIEWER = "viewer",
    LOCAL = "local"
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

    // private poseMtx: Matrix4x4 = new Matrix4x4();
    public constructor() {
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
      let nativeScaleFactor: number = XRWebGLLayer.getNativeFramebufferScaleFactor(session);
      //TODO:  Field of view könnte an der Stelle noch verändert werden.
      await session.updateRenderState({ baseLayer: new XRWebGLLayer(session, this.crc3, { framebufferScaleFactor: nativeScaleFactor }) });

      this.vrDevice = <ComponentVRDevice>this.camera;
      this.initializeReferenceSpace();

      this.useVRController = _vrController;
      if (_vrController) {
        this.vrDevice.rightCntrl.cmpTransform = new ComponentTransform();
        this.vrDevice.leftCntrl.cmpTransform = new ComponentTransform();
      }

      this.session = session;

      this.calculateTransforms();
    }

    /**
     * The AR session could be initialized here. Up till now not implemented. 
     */
    public async initializeAR(_arSessionMode: XR_SESSION_MODE = null, _arReferenceSpaceType: XR_REFERENCE_SPACE = null): Promise<void> {
      Debug.error("NOT IMPLEMENTED YET! Check out initializeVR!");
    }
    
    /**
     * Draw the xr viewport displaying its branch. By default, the transforms in the branch are recalculated first.
     * Pass `false` if calculation was already done for this frame 
     * Called from loop method {@link Loop} again with the xrFrame parameter handover, as soon as FRAME_REQUEST_XR is called from creator.
     */
    public draw(_calculateTransforms: boolean = true, _xrFrame: XRFrame = null): void {
      if (!this.session) {
        super.draw(_calculateTransforms);
        return;
      }

      let pose: XRViewerPose = _xrFrame?.getViewerPose(this.referenceSpace);
      if (!pose)
        return;

      this.vrDevice.mtxLocal.set(pose.transform.matrix);
      super.computeDrawing(_calculateTransforms);

      let glLayer: XRWebGLLayer = this.session.renderState.baseLayer;
      Render.resetFrameBuffer(glLayer.framebuffer);
      Render.clear(this.camera.clrBackground);
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

    /**
     * Move the reference space to set the initial position/orientation of the vr device in accordance to the node the vr device is attached to.
     */
    private initializeReferenceSpace(): void {
      let mtxWorld: Matrix4x4 = this.vrDevice.node?.mtxWorld;
      if (!mtxWorld)
        return;

      mtxWorld = mtxWorld.clone;
      mtxWorld.rotateY(180); // rotate because the XR Rig is looking in the direction of negative z
      let invMtxTransfom: Matrix4x4 = mtxWorld.inverse(); // inverse because we are moving the reference space
      let invOrientation: Quaternion = new Quaternion();
      invOrientation.eulerAngles = invMtxTransfom.rotation;
      XRViewport.default.referenceSpace = XRViewport.default.referenceSpace.getOffsetReferenceSpace(new XRRigidTransform(invMtxTransfom.translation, invOrientation));
    }

    //Sets controller matrices and thumbsticks movements.
    private setControllerConfigs(_xrFrame: XRFrame): void {
      if (_xrFrame) {
        if (XRViewport.default.session.inputSources.length > 0) {
          XRViewport.default.session.inputSources.forEach(_controller => {
            try {
              switch (_controller.handedness) {
                case ("right"):
                  this.vrDevice.rightCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(_controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);
                  if (!this.vrDevice.rightCntrl.gamePad)
                    this.vrDevice.rightCntrl.gamePad = _controller.gamepad;
                  else {
                    this.vrDevice.rightCntrl.thumbstickX = _controller.gamepad.axes[2];
                    this.vrDevice.rightCntrl.thumbstickY = _controller.gamepad.axes[3];
                  }
                  break;
                case ("left"):
                  this.vrDevice.leftCntrl.cmpTransform.mtxLocal.set(_xrFrame.getPose(_controller.targetRaySpace, XRViewport.default.referenceSpace).transform.matrix);

                  if (!this.vrDevice.leftCntrl.gamePad)
                    this.vrDevice.leftCntrl.gamePad = _controller.gamepad;
                  else {
                    this.vrDevice.leftCntrl.thumbstickX = _controller.gamepad.axes[2];
                    this.vrDevice.leftCntrl.thumbstickY = _controller.gamepad.axes[3];
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