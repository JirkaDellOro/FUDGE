namespace FudgeCore {
  /**
   * Controls the rendering of a branch, using the given {@link ComponentCamera},
   * and the propagation of the rendered image from the offscreen renderbuffer to the target canvas
   * through a series of {@link Framing} objects. The stages involved are in order of rendering
   * {@link Render}.viewport -> {@link Viewport}.source -> {@link Viewport}.destination -> DOM-Canvas -> Client(CSS)
   * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class Viewport extends EventTargetƒ {
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
     * Connects the viewport to the given canvas to render the given branch to using the given camera-component, and names the viewport as given.
     */
    public initialize(_name: string, _branch: Node, _camera: ComponentCamera, _canvas: HTMLCanvasElement): void {
      this.name = _name;
      this.camera = _camera;
      this.#canvas = _canvas;
      this.#crc2 = _canvas.getContext("2d");

      this.rectSource = Render.getCanvasRect();
      this.rectDestination = this.getClientRectangle();

      this.setBranch(_branch);
    }
    /**
     * Retrieve the destination canvas
     */
    public getCanvas(): HTMLCanvasElement {
      return this.#canvas;
    }
    /**
     * Retrieve the 2D-context attached to the destination canvas
     */
    public getContext(): CanvasRenderingContext2D {
      return this.#crc2;
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
      // TODO: figure out what the event handling was created for. Doesn't have another effect than information on the console (deactivated)
      if (this.#branch) {
        this.#branch.removeEventListener(EVENT.COMPONENT_ADD, this.hndComponentEvent);
        this.#branch.removeEventListener(EVENT.COMPONENT_REMOVE, this.hndComponentEvent);
      }
      this.#branch = _branch;
      if (this.#branch) {
        this.#branch.addEventListener(EVENT.COMPONENT_ADD, this.hndComponentEvent);
        this.#branch.addEventListener(EVENT.COMPONENT_REMOVE, this.hndComponentEvent);
      }
    }

    /**
     * Retrieve the branch this viewport renders
     */
    public getBranch(): Node {
      return this.#branch;
    }

    /**
     * Logs this viewports scenegraph to the console.
     * TODO: remove this method, since it's implemented in Debug
     */
    public showSceneGraph(): void {
      Debug.branch(this.#branch);
    }

    // #region Drawing
    /**
     * Draw this viewport displaying its branch. By default, the transforms in the branch are recalculated first.
     * Pass `false` if calculation was already done for this frame 
     */
    public draw(_calculateTransforms: boolean = true): void {
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

      if (this.physicsDebugMode != PHYSICS_DEBUGMODE.PHYSIC_OBJECTS_ONLY)
        Render.draw(this.camera);
      if (this.physicsDebugMode != PHYSICS_DEBUGMODE.NONE) {
        Physics.world.draw(this.camera, this.physicsDebugMode);
      }

      this.#crc2.imageSmoothingEnabled = false;
      this.#crc2.drawImage(
        Render.getCanvas(),
        this.rectSource.x, this.rectSource.y, this.rectSource.width, this.rectSource.height,
        this.rectDestination.x, this.rectDestination.y, this.rectDestination.width, this.rectDestination.height
      );
    }

    /**
     * Calculate the cascade of transforms in this branch and store the results as mtxWorld in the {@link Node}s and {@link ComponentMesh}es 
     */
    public calculateTransforms(): void {
      let mtxRoot: Matrix4x4 = Matrix4x4.IDENTITY();
      if (this.#branch.getParent())
        mtxRoot = this.#branch.getParent().mtxWorld;
      Render.prepare(this.#branch, null, mtxRoot);
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
      this.camera.projectCentral(
        rect.width / rect.height, this.camera.getFieldOfView(), this.camera.getDirection(), this.camera.getNear(), this.camera.getFar());
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

    /**
     * Switch the viewports focus on or off. Only one viewport in one FUDGE instance can have the focus, thus receiving keyboard events. 
     * So a viewport currently having the focus will lose it, when another one receives it. The viewports fire {@link Eventƒ}s accordingly.
     * // TODO: examine, if this can be achieved by regular DOM-Focus and tabindex=0
     */
    public setFocus(_on: boolean): void {
      if (_on) {
        if (Viewport.focus == this)
          return;
        if (Viewport.focus)
          Viewport.focus.dispatchEvent(new Event(EVENT.FOCUS_OUT));
        Viewport.focus = this;
        this.dispatchEvent(new Event(EVENT.FOCUS_IN));
      }
      else {
        if (Viewport.focus != this)
          return;

        this.dispatchEvent(new Event(EVENT.FOCUS_OUT));
        Viewport.focus = null;
      }
    }

    /**
     * De- / Activates the given pointer event to be propagated into the viewport as FUDGE-Event 
     */
    public activatePointerEvent(_type: EVENT_POINTER, _on: boolean): void {
      this.activateEvent(this.#canvas, _type, this.hndPointerEvent, _on);
    }

    /**
     * De- / Activates the given keyboard event to be propagated into the viewport as FUDGE-Event
     */
    public activateKeyboardEvent(_type: EVENT_KEYBOARD, _on: boolean): void {
      this.activateEvent(this.#canvas.ownerDocument, _type, this.hndKeyboardEvent, _on);
    }

    /**
     * De- / Activates the given drag-drop event to be propagated into the viewport as FUDGE-Event
     */
    public activateDragDropEvent(_type: EVENT_DRAGDROP, _on: boolean): void {
      if (_type == EVENT_DRAGDROP.START)
        this.#canvas.draggable = _on;
      this.activateEvent(this.#canvas, _type, this.hndDragDropEvent, _on);
    }

    /**
     * De- / Activates the wheel event to be propagated into the viewport as FUDGE-Event
     */
    public activateWheelEvent(_type: EVENT_WHEEL, _on: boolean): void {
      this.activateEvent(this.#canvas, _type, this.hndWheelEvent, _on);
    }

    /**
     * Handle drag-drop events and dispatch to viewport as FUDGE-Event
     */
    private hndDragDropEvent: EventListener = (_event: Event) => {
      let _dragevent: EventDragDrop = <EventDragDrop>_event;
      switch (_dragevent.type) {
        case "dragover":
        case "drop":
          _dragevent.preventDefault();
          _dragevent.dataTransfer.effectAllowed = "none";
          break;
        case "dragstart":
          // just dummy data,  valid data should be set in handler registered by the user
          _dragevent.dataTransfer.setData("text", "Hallo");
          // TODO: check if there is a better solution to hide the ghost image of the draggable object
          _dragevent.dataTransfer.setDragImage(new Image(), 0, 0);
          break;
      }
      let event: EventDragDrop = new EventDragDrop("ƒ" + _event.type, _dragevent);
      this.addCanvasPosition(event);
      this.dispatchEvent(event);
    }

    /**
     * Add position of the pointer mapped to canvas-coordinates as canvasX, canvasY to the event
     */
    private addCanvasPosition(event: EventPointer | EventDragDrop): void {
      event.canvasX = this.#canvas.width * event.pointerX / event.clientRect.width;
      event.canvasY = this.#canvas.height * event.pointerY / event.clientRect.height;
    }

    /**
     * Handle pointer events and dispatch to viewport as FUDGE-Event
     */
    private hndPointerEvent: EventListener = (_event: Event) => {
      let event: EventPointer = new EventPointer("ƒ" + _event.type, <EventPointer>_event);
      this.addCanvasPosition(event);
      this.dispatchEvent(event);
    }

    /**
     * Handle keyboard events and dispatch to viewport as FUDGE-Event, if the viewport has the focus
     */
    private hndKeyboardEvent: EventListener = (_event: Event) => {
      if (!this.hasFocus)
        return;
      let event: EventKeyboard = new EventKeyboard("ƒ" + _event.type, <EventKeyboard>_event);
      this.dispatchEvent(event);
    }

    /**
     * Handle wheel event and dispatch to viewport as FUDGE-Event
     */
    private hndWheelEvent: EventListener = (_event: Event) => {
      let event: EventWheel = new EventWheel("ƒ" + _event.type, <EventWheel>_event);
      this.dispatchEvent(event);
    }

    private activateEvent(_target: EventTarget, _type: string, _handler: EventListener, _on: boolean): void {
      _type = _type.slice(1); // chip the ƒlorin
      if (_on)
        _target.addEventListener(_type, _handler);
      else
        _target.removeEventListener(_type, _handler);
    }

    private hndComponentEvent(_event: Event): void {
      // TODO: find out what the idea was here...
      // Debug.fudge(_event);
    }
    // #endregion
  }
}
