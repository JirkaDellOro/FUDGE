namespace FudgeCore {
  export class RenderMesh {
    public smooth: RenderBuffers = null;
    public flat: RenderBuffers = null;

    public clear(): void {
      this.smooth = null;
      this.flat = null;
    }
  }

  export interface RenderBuffers {
    vertices?: WebGLBuffer;
    indices?: WebGLBuffer;
    textureUVs?: WebGLBuffer;
    normals?: WebGLBuffer;
    iBones?: WebGLBuffer;
    weights?: WebGLBuffer;
    nIndices?: number;
  }

  //Feeds WebGL Buffers with data calculated from the {@link Mesh]]
  export class RenderInjectorMesh {
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

    protected static getRenderBuffers(this: Mesh, _shader: typeof Shader): RenderBuffers {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      this.renderMesh = this.renderMesh || new RenderMesh();
      if (_shader.define.includes("FLAT")) {
        if (this.renderMesh.flat == null)
          this.renderMesh.flat = {
            vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.verticesFlat),
            indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indicesFlat),
            normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFlat),
            textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVsFlat),
            nIndices: this.indicesFlat.length
          };
        return this.renderMesh.flat;
      }
      else {
        if (this.renderMesh.smooth == null)
          this.renderMesh.smooth = {
            vertices: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices),
            indices: createBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices),
            normals: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsVertex),
            textureUVs: createBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs),
            nIndices: this.indices.length
          };
        return this.renderMesh.smooth;
      }

      function createBuffer(_type: GLenum, _array: Float32Array | Uint16Array): WebGLBuffer {
        let buffer: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
        crc3.bindBuffer(_type, buffer);
        crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
        return buffer;
      }
    }

    protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers {
      let renderBuffers: RenderBuffers = this.getRenderBuffers(_shader);
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      function setBuffer(_name: string, _buffer: WebGLBuffer): void {
        let attribute: number = _shader.attributes[_name];
        if (attribute == undefined)
          return;
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, _buffer);
        crc3.enableVertexAttribArray(attribute);
        RenderWebGL.setAttributeStructure(
          attribute,
          { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 }
        );
      }

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

      setBuffer("a_vctPosition", renderBuffers.vertices);
      setBuffer("a_vctNormal", renderBuffers.normals);


      // feed in texture coordinates if shader accepts a_vctTexture
      let attribute: number = _shader.attributes["a_vctTexture"];
      if (attribute) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.textureUVs);
        crc3.enableVertexAttribArray(attribute); // enable the buffer
        crc3.vertexAttribPointer(attribute, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      // feed in an id of the node if shader accepts u_id. Used for picking
      uniform = _shader.uniforms["u_id"];
      if (uniform)
        RenderWebGL.getRenderingContext().uniform1i(uniform, _id);

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, renderBuffers.indices);
      return renderBuffers;
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (_renderBuffers) {
        // TODO: cleanup all buffers, flat/normals is missing...
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.vertices);
        crc3.deleteBuffer(_renderBuffers.textureUVs);
        crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.indices);
      }
    }
  }
}