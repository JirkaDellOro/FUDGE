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
    }

    protected static getRenderBuffers(this: Mesh): RenderBuffers {
      if (this.renderMesh.buffers == null) {
        this.renderMesh.buffers = {
          vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.vertices),
          indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderMesh.indices),
          normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.normals),
          textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.textureUVs),
          colors: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.colors),
          tangents: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.tangents),
          nIndices: this.renderMesh.indices.length
        };

        if (this.renderMesh.bones)
          this.renderMesh.buffers.bones = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.bones);

        if (this.renderMesh.weights)
          this.renderMesh.buffers.weights = createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderMesh.weights);
      }

      return this.renderMesh.buffers;

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
        Object.values(_renderBuffers).filter(_buffer => _buffer instanceof WebGLBuffer).forEach((_buffer, _index) => {
          crc3.deleteBuffer(_buffer);
          crc3.disableVertexAttribArray(_index);
        });
      }
    }
  }
}