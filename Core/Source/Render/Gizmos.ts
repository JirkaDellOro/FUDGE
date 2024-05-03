namespace FudgeCore {

  // TODO: move this into base component class?
  /**
   * See {@link Gizmos}.
   */
  export interface Gizmo {
    node?: Node;

    /**
     * Draws a gizmo. Use {@link Gizmos} inside this method to draw stuff.
     */
    drawGizmos?(): void;

    /**
     * Draws the selected gizmo. Use {@link Gizmos} inside this method to draw stuff.
     */
    drawGizmosSelected?(): void;
  }

  /**
   * The gizmos drawing interface. Custom {@link ComponentScript}s that implement {@link Gizmo} can use this to draw gizmos inside the respective methods.
   */
  export abstract class Gizmos {
    public static selected: Node;
    public static readonly filter: Map<string, boolean> = new Map(Component.subclasses
      .filter((_class: typeof Component) => (<Gizmo>_class.prototype).drawGizmos || (<Gizmo>_class.prototype).drawGizmosSelected)
      .map((_class: typeof Component) => [_class.name, true])
    );

    /** 
     * The default opacity of occluded gizmo parts. Use this to control the visibility of gizmos behind objects.
     * Set to 0 to make occluded gizmo parts disappear. Set to 1 to make occluded gizmo parts fully visible.
     */
    private static alphaOccluded: number = 0.3; // currently gizmos can always be picked even if this is set to 0...

    private static pickId: number;
    private static readonly posIcons: Set<string> = new Set(); // cache the positions of icons to avoid drawing them within each other

    private static readonly arrayBuffer: WebGLBuffer = RenderWebGL.assert(RenderWebGL.getRenderingContext().createBuffer());
    private static readonly indexBuffer: WebGLBuffer = RenderWebGL.assert(RenderWebGL.getRenderingContext().createBuffer());

    static #camera: ComponentCamera; // TODO: maybe rather pass the camera into the drawGizmos methods on components?

    /**
     * The camera which is currently used to draw gizmos.
     */
    public static get camera(): ComponentCamera {
      return Gizmos.#camera;
    }

    private static get quad(): MeshQuad {
      let quad: MeshQuad = new MeshQuad("GizmoQuad");
      Project.deregister(quad);
      Reflect.defineProperty(Gizmos, "quad", { value: quad });
      return Gizmos.quad;
    }

    private static get cube(): MeshCube {
      let cube: MeshCube = new MeshCube("GizmoCube");
      Project.deregister(cube);
      Reflect.defineProperty(Gizmos, "cube", { value: cube });
      return Gizmos.cube;
    }

    private static get sphere(): MeshSphere {
      let sphere: MeshSphere = new MeshSphere("GizmoSphere", 6, 6);
      Project.deregister(sphere);
      Reflect.defineProperty(Gizmos, "sphere", { value: sphere });
      return Gizmos.sphere;
    }

    // TODO: think about drawing these on the fly instead of caching them. Then we could accept a position, radius etc. parameter and draw them independent from the mtxWorld
    private static get wireCircle(): Vector3[] {
      const radius: number = 0.5;
      const segments: number = 45;
      const circle: Vector3[] = new Array(segments).fill(null).map(() => Recycler.get(Vector3));
      for (let i: number = 0; i < segments; i++) {
        const angle: number = (i / segments) * 2 * Math.PI;
        const x: number = radius * Math.cos(angle);
        const y: number = radius * Math.sin(angle);
        circle[i].set(x, y, 0);
      }

      const lines: Vector3[] = [];
      for (let i: number = 0; i < segments; i++)
        lines.push(circle[i], circle[(i + 1) % segments]);

      Reflect.defineProperty(Gizmos, "wireCircle", { value: lines });
      return Gizmos.wireCircle;
    }

    private static get wireSphere(): Vector3[] {
      let lines: Vector3[] = Gizmos.wireCircle.concat();
      let mtxRotation: Matrix4x4 = Matrix4x4.ROTATION_X(90);
      lines.push(...Gizmos.wireCircle.map((_point: Vector3) => Vector3.TRANSFORMATION(_point, mtxRotation)));
      mtxRotation.rotateY(90);
      lines.push(...Gizmos.wireCircle.map((_point: Vector3) => Vector3.TRANSFORMATION(_point, mtxRotation)));

      Reflect.defineProperty(Gizmos, "wireSphere", { value: lines });
      return Gizmos.wireSphere;
    }

    private static get wireCone(): Vector3[] {
      const radius: number = 0.5;
      const height: number = 1;
      const apex: Vector3 = Vector3.ZERO();
      const quad: Vector3[] = [
        new Vector3(radius, 0, height),
        new Vector3(-radius, 0, height),
        new Vector3(0, radius, height),
        new Vector3(0, -radius, height)
      ];

      let lines: Vector3[] = Gizmos.wireCircle.map((_point: Vector3) => Vector3.TRANSFORMATION(_point, Matrix4x4.TRANSLATION(Vector3.Z(1))));

      lines.push(...[apex, quad[0], apex, quad[1], apex, quad[2], apex, quad[3]]);

      Reflect.defineProperty(Gizmos, "wireCone", { value: lines });
      return Gizmos.wireCone;
    }

    private static get wireCube(): Vector3[] {
      const halfSize: number = 0.5;
      const cube: Vector3[] = [
        new Vector3(halfSize, halfSize, halfSize), new Vector3(-halfSize, halfSize, halfSize),
        new Vector3(-halfSize, -halfSize, halfSize), new Vector3(halfSize, -halfSize, halfSize),
        new Vector3(halfSize, halfSize, -halfSize), new Vector3(-halfSize, halfSize, -halfSize),
        new Vector3(-halfSize, -halfSize, -halfSize), new Vector3(halfSize, -halfSize, -halfSize)
      ];

      const lines: Vector3[] = [
        cube[0], cube[1], cube[1], cube[2], cube[2], cube[3], cube[3], cube[0],
        cube[4], cube[5], cube[5], cube[6], cube[6], cube[7], cube[7], cube[4],
        cube[0], cube[4], cube[1], cube[5], cube[2], cube[6], cube[3], cube[7]
      ];

      Reflect.defineProperty(Gizmos, "wireCube", { value: lines });
      return Gizmos.wireCube;
    }

    /**
     * Are we currently rendering for picking?
     */
    private static get picking(): boolean {
      return this.pickId != null;
    }

    /**
     * Draws the scene's gizmos from the point of view of the given camera
     * @internal
     */
    public static draw(_cmpCamera: ComponentCamera): void {
      Gizmos.#camera = _cmpCamera;
      Gizmos.posIcons.clear();

      for (const gizmo of Render.gizmos)
        Reflect.set(gizmo.node, "zCamera", _cmpCamera.pointWorldToClip(gizmo.node.mtxWorld.translation).z);
      
      const sorted: Gizmo[] = Render.gizmos.getSorted((_a, _b) => Reflect.get(_b.node, "zCamera") - Reflect.get(_a.node, "zCamera"));
      for (const gizmo of sorted) {
        gizmo.drawGizmos?.();
        if (gizmo.node == Gizmos.selected)
          gizmo.drawGizmosSelected?.();
      }
    }

    /**
     * @internal
     */
    public static pick(_gizmos: Gizmo[], _cmpCamera: ComponentCamera, _picked: Pick[]): void {
      Gizmos.#camera = _cmpCamera;
      Gizmos.posIcons.clear();
      
      for (let gizmo of _gizmos) {
        Gizmos.pickId = _picked.length;
        gizmo.drawGizmos();
        let pick: Pick = new Pick(gizmo.node);
        pick.gizmo = gizmo;
        _picked.push(pick);
      }

      Gizmos.pickId = null;
    }

    /**
     * Draws a camera frustum for the given parameters. The frustum is oriented along the z-axis, with the tip of the truncated pyramid at the origin.
     */
    public static drawWireFrustum(_aspect: number, _fov: number, _near: number, _far: number, _direction: FIELD_OF_VIEW, _mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      const f: number = Math.tan(Calc.deg2rad * _fov / 2);

      let scaleX: number = f;
      let scaleY: number = f;

      switch (_direction) {
        case FIELD_OF_VIEW.HORIZONTAL:
          scaleY = f / _aspect;
          break;
        case FIELD_OF_VIEW.VERTICAL:
          scaleX = f * _aspect;
          break;
        case FIELD_OF_VIEW.DIAGONAL:
          const diagonalAspect: number = Math.sqrt(_aspect);
          scaleX = f * diagonalAspect;
          scaleY = f / diagonalAspect;
          break;
      }

      const nearX: number = _near * scaleX;
      const nearY: number = _near * scaleY;
      const farX: number = _far * scaleX;
      const farY: number = _far * scaleY;

      const frustum: Vector3[] = new Array(8).fill(null).map(() => Recycler.get(Vector3));

      frustum[0].set(-nearX, nearY, _near);
      frustum[1].set(nearX, nearY, _near);
      frustum[2].set(nearX, -nearY, _near);
      frustum[3].set(-nearX, -nearY, _near);

      frustum[4].set(-farX, farY, _far);
      frustum[5].set(farX, farY, _far);
      frustum[6].set(farX, -farY, _far);
      frustum[7].set(-farX, -farY, _far);

      Gizmos.drawLines([
        frustum[0], frustum[1], frustum[1], frustum[2], frustum[2], frustum[3], frustum[3], frustum[0], // near plane
        frustum[4], frustum[5], frustum[5], frustum[6], frustum[6], frustum[7], frustum[7], frustum[4], // far plane
        frustum[0], frustum[4], frustum[1], frustum[5], frustum[2], frustum[6], frustum[3], frustum[7]  // sides
      ], _mtxWorld, _color, _alphaOccluded);

      Recycler.storeMultiple(...frustum);
    }

    /**
     * Draws a wireframe cube. The cube has a side-length of 1 and is centered around the origin.
     */
    public static drawWireCube(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      Gizmos.drawLines(Gizmos.wireCube, _mtxWorld, _color, _alphaOccluded);
    }


    /**
     * Draws a wireframe sphere. The sphere has a diameter of 1 and is centered around the origin.
     */
    public static drawWireSphere(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      let mtxWorld: Matrix4x4 = _mtxWorld.clone;

      Gizmos.drawLines(Gizmos.wireSphere, mtxWorld, _color, _alphaOccluded);
      mtxWorld.lookAt(Gizmos.camera.mtxWorld.translation);
      Gizmos.drawWireCircle(mtxWorld, _color, _alphaOccluded);

      Recycler.store(mtxWorld);
    }

    /**
     * Draws a cone with a height and diameter of 1. The cone is oriented along the z-axis with the tip at the origin.
     */
    public static drawWireCone(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      Gizmos.drawLines(Gizmos.wireCone, _mtxWorld, _color, _alphaOccluded);
    }

    /**
     * Draws a circle with a diameter of 1. The circle lies in the x-y plane, with its center at the origin.
     */
    public static drawWireCircle(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      Gizmos.drawLines(Gizmos.wireCircle, _mtxWorld, _color, _alphaOccluded);
    }

    /**
     * Draws lines between each pair of the given vertices. 
     * Vertices are paired sequentially, so for example, lines will be drawn between vertices 0 and 1, 2 and 3, 4 and 5, etc.
     */
    public static drawLines(_vertices: Vector3[], _mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const lineData: Float32Array = new Float32Array(_vertices.length * 3);
      for (let i: number = 0; i < _vertices.length; i++) {
        const point: Vector3 = _vertices[i];
        lineData.set(point.get(), i * 3);
      }

      Gizmos.bufferPositions(shader, Gizmos.arrayBuffer);
      Gizmos.bufferMatrix(shader, _mtxWorld);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, lineData, WebGL2RenderingContext.DYNAMIC_DRAW);

      Gizmos.drawGizmos(shader, Gizmos.drawArrays, _vertices.length, _color, _alphaOccluded);
    }

    /**
     * Draws a wireframe mesh.
     */
    public static drawWireMesh(_mesh: Mesh, _mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const indices: number[] = [];
      const renderBuffers: RenderBuffers = _mesh.getRenderBuffers();
      const renderMesh: RenderMesh = _mesh.renderMesh; // TODO: don't breach encapsulation here...
      for (let i: number = 0; i < renderMesh.indices.length; i += 3) { // TODO: think about caching this in the mesh
        const a: number = renderMesh.indices[i];
        const b: number = renderMesh.indices[i + 1];
        const c: number = renderMesh.indices[i + 2];

        // Add the line segments for the triangle to the line indices
        indices.push(a, b, b, c, c, a);
      }

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Gizmos.indexBuffer);
      crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), WebGL2RenderingContext.DYNAMIC_DRAW);

      Gizmos.bufferPositions(shader, renderBuffers.vertices);
      Gizmos.bufferMatrix(shader, _mtxWorld);

      Gizmos.drawGizmos(shader, Gizmos.drawElementsLines, indices.length, _color, _alphaOccluded);
    }

    /**
     * Draws a solid cube.
     */
    public static drawCube(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      Gizmos.drawMesh(Gizmos.cube, _mtxWorld, _color, _alphaOccluded);
    }

    /**
     * Draws a solid sphere.
     */
    public static drawSphere(_mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      Gizmos.drawMesh(Gizmos.sphere, _mtxWorld, _color, _alphaOccluded);
    }

    /**
     * Draws a solid mesh.
     */
    public static drawMesh(_mesh: Mesh, _mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      const shader: ShaderInterface = Gizmos.picking ? ShaderPick : ShaderGizmo;
      shader.useProgram();

      let renderBuffers: RenderBuffers = _mesh.useRenderBuffers(shader, _mtxWorld, Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, _mtxWorld), Gizmos.pickId);

      Gizmos.drawGizmos(shader, Gizmos.drawElementsTrianlges, renderBuffers.nIndices, _color, _alphaOccluded);
    }

    /**
     * Draws an icon from a {@link Texture} on a {@link MeshQuad}. The icon is affected by the given transform and color.
     */
    public static drawIcon(_texture: Texture, _mtxWorld: Matrix4x4, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      let position: string = _mtxWorld.translation.toString();
      if (Gizmos.posIcons.has(position))
        return;
      Gizmos.posIcons.add(position);

      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const shader: ShaderInterface = Gizmos.picking ? ShaderPickTextured : ShaderGizmoTextured;
      shader.useProgram();

      let mtxWorld: Matrix4x4 = _mtxWorld.clone;
      let color: Color = _color.clone;

      let back: Vector3 = Gizmos.camera.mtxWorld.forward.negate();
      let up: Vector3 = Gizmos.camera.mtxWorld.up;
      mtxWorld.lookIn(back, up);

      let distance: number = Vector3.DIFFERENCE(Gizmos.camera.mtxWorld.translation, mtxWorld.translation).magnitude;
      let fadeFar: number = 4;
      let fadeNear: number = 1.5;
      if (distance > 0 && distance < fadeFar) {
        distance = (distance - fadeNear) / (fadeFar - fadeNear);
        color.a = Calc.lerp(0, color.a, distance);
      }
      
      let renderBuffers: RenderBuffers = Gizmos.quad.useRenderBuffers(shader, mtxWorld, Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, mtxWorld), Gizmos.pickId);
      _texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      crc3.uniform1i(shader.uniforms[TEXTURE_LOCATION.COLOR.UNIFORM], TEXTURE_LOCATION.COLOR.INDEX);

      Gizmos.drawGizmos(shader, Gizmos.drawElementsTrianlges, renderBuffers.nIndices, color, _alphaOccluded);

      Recycler.storeMultiple(mtxWorld, color, back, up);
    }

    private static bufferPositions(_shader: ShaderInterface, _buffer: WebGLBuffer): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
      let attribute: number = _shader.attributes["a_vctPosition"];
      crc3.enableVertexAttribArray(attribute);
      crc3.vertexAttribPointer(attribute, 3, WebGL2RenderingContext.FLOAT, false, 0, 0);
    }

    private static bufferColor(_shader: ShaderInterface, _color: Color): void {
      RenderWebGL.getRenderingContext().uniform4fv(_shader.uniforms["u_vctColor"], _color.getArray());
    }

    private static bufferMatrix(_shader: ShaderInterface, _mtxWorld: Matrix4x4): void {
      const mtxMeshToView: Matrix4x4 = Matrix4x4.MULTIPLICATION(Gizmos.camera.mtxWorldToView, _mtxWorld);
      RenderWebGL.getRenderingContext().uniformMatrix4fv(_shader.uniforms["u_mtxMeshToView"], false, mtxMeshToView.get());
      Recycler.store(mtxMeshToView);
    }

    private static drawGizmos(_shader: ShaderInterface, _draw: Function, _count: number, _color: Color, _alphaOccluded: number = Gizmos.alphaOccluded): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let color: Color = _color.clone;
      Gizmos.bufferColor(_shader, color);

      // stencil stuff is for semi-transparent gizmos to have correct self occlusion
      // first draw the gizmo opaque with depth test and set drawn pixels to 1 in stencil buffer
      crc3.clear(WebGL2RenderingContext.STENCIL_BUFFER_BIT);
      crc3.stencilFunc(WebGL2RenderingContext.ALWAYS, 1, 0xFF);
      crc3.stencilOp(WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP, WebGL2RenderingContext.REPLACE);
      crc3.enable(WebGL2RenderingContext.STENCIL_TEST);
      _draw(_count);

      // then draw the gizmo again with reduced alpha and without depth test where stencil buffer is 0
      color.a *= _alphaOccluded;
      Gizmos.bufferColor(_shader, color);

      crc3.stencilFunc(WebGL2RenderingContext.EQUAL, 0, 0xFF);
      crc3.stencilOp(WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP, WebGL2RenderingContext.KEEP);
      Render.setDepthTest(false);
      _draw(_count);
      Render.setDepthTest(true);
      crc3.disable(WebGL2RenderingContext.STENCIL_TEST);

      Recycler.store(color);
    }

    private static drawElementsTrianlges(_count: number): void {
      RenderWebGL.getRenderingContext().drawElements(WebGL2RenderingContext.TRIANGLES, _count, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }

    private static drawElementsLines(_count: number): void {
      RenderWebGL.getRenderingContext().drawElements(WebGL2RenderingContext.LINES, _count, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }

    private static drawArrays(_count: number): void {
      RenderWebGL.getRenderingContext().drawArrays(WebGL2RenderingContext.LINES, 0, _count);
    }
  }
}