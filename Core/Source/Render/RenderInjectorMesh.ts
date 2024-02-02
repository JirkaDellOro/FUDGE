namespace FudgeCore {

  /**
   * Buffers the data from the {@link Mesh} into a WebGL Buffer
   * @internal
   */
  export class RenderInjectorMesh {

    /**
     * Injects the functionality of this class into the constructor of the given {@link Mesh}-subclass
     */
    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
        value: RenderInjectorMesh.useRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "getRenderBuffers", {
        value: RenderInjectorMesh.getRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
        value: RenderInjectorMesh.deleteRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "setRenderMesh", {
        value: RenderInjectorMesh.setRenderMesh
      });
    }

    protected static getRenderBuffers(this: Mesh): RenderBuffers {
      this.ƒrenderMesh = this.ƒrenderMesh || new RenderMesh(this);

      if (this.ƒrenderMesh.buffers == null)
        this.ƒrenderMesh.buffers = {
          vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.vertices),
          indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.ƒrenderMesh.indices),
          normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.normals),
          textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.textureUVs),
          colors: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.colors),
          tangents: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.tangents),
          nIndices: this.ƒrenderMesh.indices.length
        };

      if (this.ƒrenderMesh.bones)
        this.ƒrenderMesh.buffers.bones = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.bones);

      if (this.ƒrenderMesh.weights)
        this.ƒrenderMesh.buffers.weights = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.ƒrenderMesh.weights);

      return this.ƒrenderMesh.buffers;

      function createBuffer(_type: GLenum, _array: Float32Array | Uint16Array | Uint8Array): WebGLBuffer {
        const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
        let buffer: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
        crc3.bindBuffer(_type, buffer);
        crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
        return buffer;
      }
    }

    protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let renderBuffers: RenderBuffers = this.getRenderBuffers();

      let uniform: WebGLUniformLocation;

      uniform = _shader.uniforms["u_mtxMeshToView"];
      crc3.uniformMatrix4fv(uniform, false, _mtxMeshToView.get());

      uniform = _shader.uniforms["u_mtxMeshToWorld"];
      if (uniform)
        crc3.uniformMatrix4fv(uniform, false, _mtxMeshToWorld.get());

      uniform = _shader.uniforms["u_mtxNormalMeshToWorld"];
      if (uniform) {
        let normalMatrix: Matrix4x4 = Matrix4x4.TRANSPOSE(Matrix4x4.INVERSION(_mtxMeshToWorld));
        crc3.uniformMatrix4fv(uniform, false, normalMatrix.get());
      }

      // feed in an id of the node if shader accepts u_id. Used for picking
      uniform = _shader.uniforms["u_id"];
      if (uniform)
        crc3.uniform1i(uniform, _id);

      setAttributeBuffer("a_vctPosition", renderBuffers.vertices, 3);
      setAttributeBuffer("a_vctColor", renderBuffers.colors, 4);
      setAttributeBuffer("a_vctTexture", renderBuffers.textureUVs, 2);
      setAttributeBuffer("a_vctNormal", renderBuffers.normals, 3);
      setAttributeBuffer("a_vctTangent", renderBuffers.tangents, 4);

      const aBone: number = _shader.attributes["a_vctBones"];
      if (aBone) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.bones);
        crc3.enableVertexAttribArray(aBone);
        crc3.vertexAttribIPointer(aBone, 4, WebGL2RenderingContext.UNSIGNED_BYTE, 0, 0);
      }
      setAttributeBuffer("a_vctWeights", renderBuffers.weights, 4);

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);

      return renderBuffers;

      function setAttributeBuffer(_name: string, _buffer: WebGLBuffer, _size: number): void {
        let attribute: number = _shader.attributes[_name];
        if (attribute == undefined)
          return;
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
        crc3.enableVertexAttribArray(attribute);
        crc3.vertexAttribPointer(attribute, _size, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (_renderBuffers) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.indices);
        crc3.deleteBuffer(_renderBuffers.vertices);
        crc3.deleteBuffer(_renderBuffers.colors);
        crc3.deleteBuffer(_renderBuffers.textureUVs);
        crc3.deleteBuffer(_renderBuffers.normals);
        crc3.deleteBuffer(_renderBuffers.tangents);
        crc3.deleteBuffer(_renderBuffers.bones);
        crc3.deleteBuffer(_renderBuffers.weights);
      }
    }

    protected static setRenderMesh(this: Mesh, _renderMesh: RenderMesh): void {
      const vertices: Float32Array = _renderMesh.vertices;
      const indices: Uint16Array = _renderMesh.indices;
      const normals: Float32Array = _renderMesh.normals;
      const textureUVs: Float32Array = _renderMesh.textureUVs;
      const colors: Float32Array = _renderMesh.colors;
      const tangents: Float32Array = _renderMesh.tangents;
      const bones: Uint8Array = _renderMesh.bones;
      const weights: Float32Array = _renderMesh.weights;

      // Clear the mesh
      this.vertices.length = 0;
      this.faces.length = 0;

      // Create mesh vertices and faces so that normals and tangents can be calculated if missing. If they are not missing this could be omitted.
      for (let iVector2: number = 0, iVector3: number = 0, iVector4: number = 0; iVector3 < vertices?.length; iVector2 += 2, iVector3 += 3, iVector4 += 4) {
        this.vertices.push(
          new Vertex(
            new Vector3(vertices[iVector3 + 0], vertices[iVector3 + 1], vertices[iVector3 + 2]),
            textureUVs ?
              new Vector2(textureUVs[iVector2 + 0], textureUVs[iVector2 + 1]) :
              undefined,
            normals ?
              new Vector3(normals[iVector3 + 0], normals[iVector3 + 1], normals[iVector3 + 2]) :
              undefined,
            tangents ?
              new Vector4(tangents[iVector4 + 0], tangents[iVector4 + 1], tangents[iVector4 + 2], tangents[iVector4 + 3]) :
              undefined,
            colors ?
              new Color(colors[iVector4 + 0], colors[iVector4 + 1], colors[iVector4 + 2], colors[iVector4 + 3]) :
              undefined,
            bones && weights ?
              [
                { index: bones[iVector4 + 0], weight: weights[iVector4 + 0] },
                { index: bones[iVector4 + 1], weight: weights[iVector4 + 1] },
                { index: bones[iVector4 + 2], weight: weights[iVector4 + 2] },
                { index: bones[iVector4 + 3], weight: weights[iVector4 + 3] }
              ] :
              undefined
          )
        );
      }

      for (let iFaceVertexIndex: number = 0; iFaceVertexIndex < indices?.length; iFaceVertexIndex += 3) {
        try {
          this.faces.push(new Face(
            this.vertices,
            indices[iFaceVertexIndex + 0],
            indices[iFaceVertexIndex + 1],
            indices[iFaceVertexIndex + 2]
          ));
        } catch (_e: unknown) {
          Debug.fudge("Face excluded", (<Error>_e).message);
        }
      }
    }
  }
}