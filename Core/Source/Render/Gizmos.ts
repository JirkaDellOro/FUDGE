namespace FudgeCore {

  export class Gizmos extends RenderWebGL {
    /** The {@link Color} used to draw gizmos. Use colors set methods to apply your color. */
    public static readonly color: Color = Color.CSS("white");
    /** The {@link Matrix4x4} used to draw gizmos. Use matrixs set method to apply your transform. */
    public static readonly mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY();
    public static depthTest: boolean = true;

    private static readonly arrayBuffer: WebGLBuffer = RenderWebGL.assert(RenderWebGL.crc3.createBuffer());
    private static readonly indexBuffer: WebGLBuffer = RenderWebGL.assert(RenderWebGL.crc3.createBuffer());

    static #quad: MeshQuad;
    static #cube: MeshCube;
    static #sphere: MeshSphere;

    private static get quad(): MeshQuad {
      if (!Gizmos.#quad) {
        Gizmos.#quad = new MeshQuad("GizmoQuad");
        Project.deregister(Gizmos.#quad);
      }

      return Gizmos.#quad;
    }

    private static get cube(): MeshCube {
      if (!Gizmos.#cube) {
        Gizmos.#cube = new MeshCube("GizmoCube");
        Project.deregister(Gizmos.#cube);
      }

      return Gizmos.#cube;
    }

    private static get sphere(): MeshSphere {
      if (!Gizmos.#sphere) {
        Gizmos.#sphere = new MeshSphere("GizmoSphere", 8, 6);
        Project.deregister(Gizmos.#sphere);
      }

      return Gizmos.#sphere;
    }

    /**
     * Draws a camera frustum for the given parameters. The frustum is oriented along the z-axis, with the tip of the truncated pyramid at the origin.
     */
    public static drawWireFrustum(_aspect: number, _fov: number, _near: number, _far: number, _direction: FIELD_OF_VIEW): void {
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

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
      ]);

      Recycler.storeMultiple(...frustum);
    }

    /**
     * Draws a wireframe cube.
     */
    public static drawWireCube(_size: number = 1): void {
      const halfSize: number = _size / 2;
      const cube: Vector3[] = new Array(8).fill(null).map(() => Recycler.get(Vector3));
      cube[0].set(halfSize, halfSize, halfSize); cube[1].set(-halfSize, halfSize, halfSize);
      cube[2].set(-halfSize, -halfSize, halfSize); cube[3].set(halfSize, -halfSize, halfSize);
      cube[4].set(halfSize, halfSize, -halfSize); cube[5].set(-halfSize, halfSize, -halfSize);
      cube[6].set(-halfSize, -halfSize, -halfSize); cube[7].set(halfSize, -halfSize, -halfSize);
      Gizmos.drawLines([
        cube[0], cube[1], cube[1], cube[2], cube[2], cube[3], cube[3], cube[0],
        cube[4], cube[5], cube[5], cube[6], cube[6], cube[7], cube[7], cube[4],
        cube[0], cube[4], cube[1], cube[5], cube[2], cube[6], cube[3], cube[7]
      ]);
      Recycler.storeMultiple(...cube);
    }

    /**
     * Draws a wireframe sphere.
     */
    public static drawWireSphere(_radius: number = 0.5): void {
      Gizmos.drawWireCircle(_radius);
      Gizmos.mtxWorld.rotateY(90);
      Gizmos.drawWireCircle(_radius);
      Gizmos.mtxWorld.rotateX(90);
      Gizmos.drawWireCircle(_radius);
    }

    /**
     * Draws a cone for the given parameters. The cone is oriented along the z-axis with the tip at the origin.
     */
    public static drawWireCone(_height: number = 1, _radius: number = 1, _segments: number = 45): void {
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const apex: Vector3 = Vector3.ZERO();
      const quad: Vector3[] = new Array(4).fill(null).map(() => Recycler.get(Vector3));
      quad[0].set(_radius, 0, _height);
      quad[1].set(-_radius, 0, _height);
      quad[2].set(0, _radius, _height);
      quad[3].set(0, -_radius, _height);

      Gizmos.mtxWorld.translateZ(_height);
      Gizmos.drawWireCircle(_radius, _segments);
      Gizmos.mtxWorld.translateZ(-_height);
      Gizmos.drawLines([apex, quad[0], apex, quad[1], apex, quad[2], apex, quad[3]]);
      Recycler.storeMultiple(apex, ...quad);
    }

    /**
     * Draws a circle for the given parameters. The circle lies in the x-y plane, with its center at the origin.
     */
    public static drawWireCircle(_radius: number = 1, _segments: number = 45): void {
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const circle: Vector3[] = new Array(_segments).fill(null).map(() => Recycler.get(Vector3));
      for (let i: number = 0; i < _segments; i++) {
        const angle: number = (i / _segments) * 2 * Math.PI;
        const x: number = _radius * Math.cos(angle);
        const y: number = _radius * Math.sin(angle);
        circle[i].set(x, y, 0);
      }

      const lines: Vector3[] = [];
      for (let i: number = 0; i < _segments; i++)
        lines.push(circle[i], circle[(i + 1) % _segments]);

      Gizmos.drawLines(lines);
      Recycler.storeMultiple(...circle);
    }

    /**
     * Draws lines between each pair of the given vertices. 
     * Vertices are paired sequentially, so for example, lines will be drawn between vertices 0 and 1, 2 and 3, 4 and 5, etc.
     */
    public static drawLines(_vertices: Vector3[]): void {
      const crc3: WebGL2RenderingContext = Gizmos.getRenderingContext();
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const lineData: Float32Array = new Float32Array(_vertices.length * 3);
      for (let i: number = 0; i < _vertices.length; i++) {
        const point: Vector3 = _vertices[i];
        lineData.set(point.get(), i * 3);
      }

      Gizmos.buffer(shader, Gizmos.arrayBuffer, lineData);

      Render.setDepthTest(Gizmos.depthTest);
      crc3.drawArrays(WebGL2RenderingContext.LINES, 0, _vertices.length);
      Render.setDepthTest(!Gizmos.depthTest);
    }

    /**
     * Draws a wireframe mesh.
     */
    public static drawWireMesh(_mesh: Mesh): void {
      const crc3: WebGL2RenderingContext = Gizmos.getRenderingContext();
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const indices: number[] = [];
      const renderBuffers: RenderBuffers = _mesh.getRenderBuffers();
      const renderMesh: RenderMesh = _mesh.renderMesh;
      for (let i: number = 0; i < renderMesh.indices.length; i += 3) { // TODO: think about caching this in the mesh
        const a: number = renderMesh.indices[i];
        const b: number = renderMesh.indices[i + 1];
        const c: number = renderMesh.indices[i + 2];

        // Add the line segments for the triangle to the line indices
        indices.push(a, b, b, c, c, a);
      }

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, Gizmos.indexBuffer);
      crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), WebGL2RenderingContext.DYNAMIC_DRAW);

      Gizmos.buffer(shader, renderBuffers.vertices);

      Render.setDepthTest(Gizmos.depthTest);
      crc3.drawElements(WebGL2RenderingContext.LINES, indices.length, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      Render.setDepthTest(!Gizmos.depthTest);
    }

    /**
     * Draws a solid cube.
     */
    public static drawCube(): void {
      Gizmos.drawMesh(Gizmos.cube);
    }

    /**
     * Draws a solid sphere.
     */
    public static drawSphere(): void {
      Gizmos.drawMesh(Gizmos.sphere);
    }

    /**
     * Draws a solid mesh.
     */
    public static drawMesh(_mesh: Mesh): void {
      const crc3: WebGL2RenderingContext = Gizmos.getRenderingContext();
      const shader: typeof Shader = ShaderGizmo;
      shader.useProgram();

      const renderBuffers: RenderBuffers = _mesh.getRenderBuffers();
      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);
      Gizmos.buffer(shader, renderBuffers.vertices);

      Render.setDepthTest(Gizmos.depthTest);
      crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      Render.setDepthTest(!Gizmos.depthTest);
    }

    /**
     * Draws a {@link Texture} on a {@link MeshQuad}. The texture can be used as an alpha mask.
     */
    public static drawIcon(_texture: Texture, _asMask: boolean = false): void {
      const crc3: WebGL2RenderingContext = Gizmos.getRenderingContext();
      const shader: typeof Shader = ShaderGizmoTextured;
      shader.useProgram();

      Gizmos.mtxWorld.lookAt(Render.camera.mtxWorld.translation, Vector3.Y());

      // TODO: mostly copied from Mesh Render Injector, find a way to reuse code
      const renderBuffers: RenderBuffers = Gizmos.quad.getRenderBuffers();
      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);
      let attribute: number = shader.attributes["a_vctTexture"];
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.textureUVs);
      crc3.enableVertexAttribArray(attribute); // enable the buffer
      crc3.vertexAttribPointer(attribute, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      Gizmos.buffer(shader, renderBuffers.vertices);

      _texture.useRenderData(TEXTURE_LOCATION.COLOR.UNIT);
      crc3.uniform1i(shader.uniforms[TEXTURE_LOCATION.COLOR.UNIFORM], TEXTURE_LOCATION.COLOR.INDEX);
      crc3.uniform1i(shader.uniforms["u_bMask"], _asMask ? 1 : 0);

      Render.setDepthTest(Gizmos.depthTest);
      crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      Render.setDepthTest(!Gizmos.depthTest);
    }

    private static buffer(_shader: typeof Shader, _buffer: WebGLBuffer, _data?: Float32Array): void {
      const crc3: WebGL2RenderingContext = Gizmos.getRenderingContext();

      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
      let attribute: number = _shader.attributes["a_vctPosition"];
      crc3.enableVertexAttribArray(attribute);
      crc3.vertexAttribPointer(attribute, 3, WebGL2RenderingContext.FLOAT, false, 0, 0);
      if (_data)
        crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, _data, WebGL2RenderingContext.DYNAMIC_DRAW);

      crc3.uniformMatrix4fv(_shader.uniforms["u_mtxModel"], false, Gizmos.mtxWorld.get());
      crc3.uniformMatrix4fv(_shader.uniforms["u_mtxViewProjection"], false, Render.camera.mtxWorldToView.get());
      crc3.uniform4fv(_shader.uniforms["u_vctColor"], Gizmos.color.getArray());
    }
  }
}