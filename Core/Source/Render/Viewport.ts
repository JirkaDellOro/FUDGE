namespace FudgeCore {
  /**
   * Controls the rendering of a branch, using the given {@link ComponentCamera},
   * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
   * through a series of {@link Framing} objects. The stages involved are in order of rendering
   * {@link Render}.viewport -> {@link Viewport}.source -> {@link Viewport}.destination -> DOM-Canvas -> Client(CSS)
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019-2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Viewport
   */
  export class Viewport extends EventTargetUnified {
    private static focus: Viewport;

    public name: string = "Viewport"; // The name to call this viewport by.
    public camera: ComponentCamera = null; // The camera representing the view parameters to render the branch.
    public rectSource: Rectangle;
    public rectDestination: Rectangle;

    // TODO: verify if client to canvas should be in Viewport or somewhere else (Window, Container?)
    // Multiple viewports using the same canvas shouldn't differ here...
    // different framing methods can be used, this is the default
    public frameClientToCanvas: FramingScaled = new FramingScaled();
    public frameCanvasToDestination: FramingComplex = new FramingComplex();
    public frameDestinationToSource: FramingScaled = new FramingScaled();
    public frameSourceToRender: FramingScaled = new FramingScaled();

    public adjustingFrames: boolean = true;
    public adjustingCamera: boolean = true;
    public physicsDebugMode: PHYSICS_DEBUGMODE = PHYSICS_DEBUGMODE.NONE;

    public componentsPick: RecycableArray<ComponentPick> = new RecycableArray();

    #branch: Node = null; // The to render with all its descendants.
    #crc2: CanvasRenderingContext2D = null;
    #canvas: HTMLCanvasElement = null;
    //#endregion

    // #region Events (passing from canvas to viewport and from there into branch)
    /**
     * Returns true if this viewport currently has focus and thus receives keyboard events
     */
    public get hasFocus(): boolean {
      return (Viewport.focus == this);
    }

    /**
     * Retrieve the destination canvas
     */
    public get canvas(): HTMLCanvasElement {
      return this.#canvas;
    }
    /**
     * Retrieve the 2D-context attached to the destination canvas
     */
    public get context(): CanvasRenderingContext2D {
      return this.#crc2;
    }

    /**
     * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
     */
    public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
      this.name = _name;
      this.camera = _camera;
      this.#canvas = _canvas;
      this.#crc2 = _canvas.getContext("2d");
      this.#canvas.tabIndex = 0; // can get focus and receive keyboard events

      this.rectSource = Render.getCanvasRect();
      this.rectDestination = this.getClientRectangle();

      this.setBranch(_branch);
    }
    /**
     * Retrieve the size of the destination canvas as a rectangle, x and y are always 0 
     */
    public getCanvasRectangle(): Rectangle {
      return Rectangle.GET(0, 0, this.#canvas.width, this.#canvas.height);
    }
    /**
     * Retrieve the client rectangle the canvas is displayed and fit in, x and y are always 0 
     */
    public getClientRectangle(): Rectangle {
      // FUDGE doesn't care about where the client rect is, only about the size matters.
      // return Rectangle.GET(this.canvas.offsetLeft, this.canvas.offsetTop, this.canvas.clientWidth, this.canvas.clientHeight);
      return Rectangle.GET(0, 0, this.#canvas.clientWidth, this.#canvas.clientHeight);
    }

    /**
     * Set the branch to be drawn in the viewport.
     */
    public setBranch(_branch: Node): void {
      if (_branch)
        _branch.dispatchEvent(new Event(EVENT.ATTACH_BRANCH));
      this.#branch = _branch;
    }

    /**
     * Retrieve the branch this viewport renders
     */
    public getBranch(): Node {
      return this.#branch;
    }

    // #region Drawing
    /**
     * Draw this viewport displaying its branch. By default, the transforms in the branch are recalculated first.
     * Pass `false` if calculation was already done for this frame 
     */
    public draw(_calculateTransforms: boolean = true): void {
      this.computeDrawing(_calculateTransforms);
      if (this.physicsDebugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
        Render.draw(this.camera);
      if (this.physicsDebugMode != PHYSICS_DEBUGMODE.NONE) {
        Physics.draw(this.camera, this.physicsDebugMode);
      }

      this.#crc2.imageSmoothingEnabled = false;
      this.#crc2.drawImage(
        Render.getCanvas(),
        this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
        this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
      );
    }
    /**
    * The transforms in the branch are recalculated here.
    */
    public computeDrawing(_calculateTransforms: boolean = true) {
      if (!this.#branch)
        return;
      Render.resetFrameBuffer();
      if (!this.camera.isActive)
        return;
      if (this.adjustingFrames)
        this.adjustFrames();
      if (this.adjustingCamera)
        this.adjustCamera();

      if (_calculateTransforms)
        this.calculateTransforms();

      Render.clear(this.camera.clrBackground);
    }
    /**
     * Calculate the cascade of transforms in this branch and store the results as mtxWorld in the {@link Node}s and {@link ComponentMesh}es 
     */
    public calculateTransforms(): void {
      let mtxRoot: Matrix4x4 = Matrix4x4.IDENTITY();
      if (this.#branch.getParent())
        mtxRoot = this.#branch.getParent().mtxWorld;
      this.dispatchEvent(new Event(EVENT.RENDER_PREPARE_START));
      this.adjustFrames();
      Render.prepare(this.#branch, null, mtxRoot);
      this.dispatchEvent(new Event(EVENT.RENDER_PREPARE_END));
      this.componentsPick = Render.componentsPick;
    }

    /**
     * Performs a pick on all {@link ComponentPick}s in the branch of this viewport
     * using a ray from its camera through the client coordinates given in the event.
     * Dispatches the event to all nodes hit.  
     * If {@link PICK.CAMERA} was chosen as the method to pick, a pick property gets added to the event, 
     * which holds the detailed information, but is overwritten for each node.
     */
    public dispatchPointerEvent(_event: PointerEvent): void {
      let posClient: Vector2 = new Vector2(_event.clientX, _event.clientY);
      let ray: Ray = this.getRayFromClient(posClient);
      // let cameraPicks: RecycableArray<Node> = Recycler.get(RecycableArray); //TODO: think about optimization later
      let cameraPicks: Node[] = [];
      let otherPicks: ComponentPick[] = [];
      for (let cmpPick of this.componentsPick)
        cmpPick.pick == PICK.CAMERA ? cameraPicks.push(cmpPick.node) : otherPicks.push(cmpPick);

      if (cameraPicks.length) {
        let picks: Pick[] = Picker.pickCamera(cameraPicks, this.camera, this.pointClientToProjection(posClient));
        for (let pick of picks) {
          Reflect.set(_event, "pick", pick);
          pick.node.dispatchEvent(_event); 
        }
      }

      for (let cmpPick of otherPicks) {
        cmpPick.pickAndDispatch(ray, _event);
      }
    }

    /**
     * Adjust all frames involved in the rendering process from the display area in the client up to the renderer canvas
     */
    public adjustFrames(): void {
      // get the rectangle of the canvas area as displayed (consider css)
      let rectClient: Rectangle = this.getClientRectangle();
      // adjust the canvas size according to the given framing applied to client
      let rectCanvas: Rectangle = this.frameClientToCanvas.getRect(rectClient);
      this.#canvas.width = rectCanvas.width;
      this.#canvas.height = rectCanvas.height;

      let rectTemp: Rectangle;
      // adjust the destination area on the target-canvas to render to by applying the framing to canvas
      rectTemp = this.frameCanvasToDestination.getRect(rectCanvas);
      this.rectDestination.copy(rectTemp);
      Recycler.store(rectTemp);
      // adjust the area on the source-canvas to render from by applying the framing to destination area
      rectTemp = this.frameDestinationToSource.getRect(this.rectDestination);
      this.rectSource.copy(rectTemp);
      Recycler.store(rectTemp);

      // having an offset source does make sense only when multiple viewports display parts of the same rendering. For now: shift it to 0,0
      this.rectSource.x = this.rectSource.y = 0;
      // still, a partial image of the rendering may be retrieved by moving and resizing the render viewport. For now, it's always adjusted to the current viewport
      let rectRender: Rectangle = this.frameSourceToRender.getRect(this.rectSource);
      Render.setRenderRectangle(rectRender);
      // no more transformation after this for now, offscreen canvas and render-viewport have the same size
      Render.setCanvasSize(rectRender.width, rectRender.height);

      Recycler.store(rectClient);
      Recycler.store(rectCanvas);
      Recycler.store(rectRender);
    }

    /**
     * Adjust the camera parameters to fit the rendering into the render vieport
     */
    public adjustCamera(): void {
      let rect: Rectangle = Render.getRenderRectangle();
      // if (this.camera.getProjection() == PROJECTION.ORTHOGRAPHIC)
      //   this.camera.projectOrthographic(-rect.width / 20, rect.width / 20, rect.height / 20, -rect.height / 20);
      // else
      this.camera.projectCentral(
        rect.width / rect.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar()
      );
    }
    // #endregion

    //#region Points
    /**
     * Returns a {@link Ray} in world coordinates from this camera through the point given in client space
     */
    public getRayFromClient(_point: Vector2): Ray {
      let posProjection: Vector2 = this.pointClientToProjection(_point);
      let ray: Ray = new Ray(new Vector3(-posProjection.x, posProjection.y, 1));

      // ray.direction.scale(camera.distance);
      ray.origin.transform(this.camera.mtxPivot);
      ray.direction.transform(this.camera.mtxPivot, false);
      let cameraNode: Node = this.camera.node;
      if (cameraNode) {
        ray.origin.transform(cameraNode.mtxWorld);
        ray.direction.transform(cameraNode.mtxWorld, false);
      }
      return ray;
    }

    /**
     * Returns a point on the client rectangle matching the projection of the given point in world space
     */
    public pointWorldToClient(_position: Vector3): Vector2 {
      let projection: Vector3 = this.camera.pointWorldToClip(_position);
      let posClient: Vector2 = this.pointClipToClient(projection.toVector2());
      return posClient;
    }

    /**
     * Returns a point on the source-rectangle matching the given point on the client rectangle
     */
    public pointClientToSource(_client: Vector2): Vector2 {
      let result: Vector2 = this.frameClientToCanvas.getPoint(_client, this.getClientRectangle());
      result = this.frameCanvasToDestination.getPoint(result, this.getCanvasRectangle());
      result = this.frameDestinationToSource.getPoint(result, this.rectSource);
      //TODO: when Source, Render and RenderViewport deviate, continue transformation 
      return result;
    }

    /**
     * Returns a point on the render-rectangle matching the given point on the source rectangle
     */
    public pointSourceToRender(_source: Vector2): Vector2 {
      let projectionRectangle: Rectangle = this.camera.getProjectionRectangle();
      let point: Vector2 = this.frameSourceToRender.getPoint(_source, projectionRectangle);
      // console.log(projectionRectangle.toString());
      return point;
    }

    /**
     * Returns a point on the render-rectangle matching the given point on the client rectangle
     */
    public pointClientToRender(_client: Vector2): Vector2 {
      let point: Vector2 = this.pointClientToSource(_client);
      point = this.pointSourceToRender(point);
      //TODO: when Render and RenderViewport deviate, continue transformation 
      return point;
    }

    /**
     * Returns a point on a projection surface in the hypothetical distance of 1 to the camera  
     * matching the given point on the client rectangle
     * TODO: examine, if this should be a camera-method. Current implementation is for central-projection
     */
    public pointClientToProjection(_client: Vector2): Vector2 {
      let posRender: Vector2 = this.pointClientToRender(_client);
      let rectRender: Rectangle = this.frameSourceToRender.getRect(this.rectSource);
      let rectProjection: Rectangle = this.camera.getProjectionRectangle();

      let posProjection: Vector2 = new Vector2(
        rectProjection.width * posRender.x / rectRender.width,
        rectProjection.height * posRender.y / rectRender.height
      );

      posProjection.subtract(new Vector2(rectProjection.width / 2, rectProjection.height / 2));
      posProjection.y *= -1;

      return posProjection;
    }

    /**
     * Returns a point in the client rectangle matching the given point in normed clipspace rectangle, 
     * which stretches from -1 to 1 in both dimensions, y pointing up
     */
    public pointClipToClient(_normed: Vector2): Vector2 {
      // let rectClient: Rectangle = this.getClientRectangle();
      // let result: Vector2 = Vector2.ONE(0.5);
      // result.x *= (_normed.x + 1) * rectClient.width;
      // result.y *= (1 - _normed.y) * rectClient.height;
      // result.add(rectClient.position);
      //TODO: check if rectDestination can safely (and more perfomant) be used instead getClientRectangle
      let pointClient: Vector2 = Render.rectClip.pointToRect(_normed, this.rectDestination);
      return pointClient;
    }

    /**
     * Returns a point in the client rectangle matching the given point in normed clipspace rectangle, 
     * which stretches from -1 to 1 in both dimensions, y pointing up
     */
    public pointClipToCanvas(_normed: Vector2): Vector2 {
      let pointCanvas: Vector2 = Render.rectClip.pointToRect(_normed, this.getCanvasRectangle());
      return pointCanvas;
    }

    /**
     * Returns a point in the browser page matching the given point of the viewport
     */
    public pointClientToScreen(_client: Vector2): Vector2 {
      let screen: Vector2 = new Vector2(this.#canvas.offsetLeft + _client.x, this.#canvas.offsetTop + _client.y);
      return screen;
    }
  }
}
