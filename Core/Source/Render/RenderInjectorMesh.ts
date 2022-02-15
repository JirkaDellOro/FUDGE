namespace FudgeCore {
  export interface RenderBuffers {
    vertices: WebGLBuffer;
    indices: WebGLBuffer;
    nIndices: number;
    textureUVs: WebGLBuffer;
    normalsFlat: WebGLBuffer;
    normalsVertex: WebGLBuffer;
    iBones?: WebGLBuffer;
    weights?: WebGLBuffer;
  }
 //gives WebGL Buffer the data from the {@link Mesh]]
  export class RenderInjectorMesh {
    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
        value: RenderInjectorMesh.useRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "createRenderBuffers", {
        value: RenderInjectorMesh.createRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
        value: RenderInjectorMesh.deleteRenderBuffers
      });
    }

    protected static createRenderBuffers(this: Mesh): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let vertices: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices, WebGL2RenderingContext.STATIC_DRAW);

      let indices: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
      crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices, WebGL2RenderingContext.STATIC_DRAW);

      let textureUVs: WebGLBuffer = crc3.createBuffer();
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs, WebGL2RenderingContext.STATIC_DRAW);

      let normalsFlat: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFlat);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFlat, WebGL2RenderingContext.STATIC_DRAW);

      let normalsVertex: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsVertex);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsVertex, WebGL2RenderingContext.STATIC_DRAW);

      let renderBuffers: RenderBuffers = {
        vertices: vertices,
        indices: indices,
        nIndices: this.getIndexCount(),
        textureUVs: textureUVs,
        normalsFlat: normalsFlat,
        normalsVertex: normalsVertex
      };

      this.renderBuffers = renderBuffers;
    }

    protected static useRenderBuffers(this: Mesh, _shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number): void {
      if (!this.renderBuffers)
        this.createRenderBuffers();
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      let aPosition: number = _shader.attributes["a_position"];
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.vertices);
      crc3.enableVertexAttribArray(aPosition);
      RenderWebGL.setAttributeStructure(aPosition, Mesh.getBufferSpecification());

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indices);

      let uProjection: WebGLUniformLocation = _shader.uniforms["u_projection"];
      crc3.uniformMatrix4fv(uProjection, false, _mtxProjection.get());

      // feed in face normals if shader accepts u_world. 
      let uWorld: WebGLUniformLocation = _shader.uniforms["u_world"];
      if (uWorld) {
        crc3.uniformMatrix4fv(uWorld, false, _mtxWorld.get());
      }

      let uNormal: WebGLUniformLocation = _shader.uniforms["u_normal"];
      if (uNormal) {
        // TODO: optimize so that inversion or whole normalMatrix is cached
        let normalMatrix: Matrix4x4 = Matrix4x4.TRANSPOSE(Matrix4x4.INVERSION(_mtxWorld));
        crc3.uniformMatrix4fv(uNormal, false, normalMatrix.get());
      }

      let aNormalFace: number = _shader.attributes["a_normalFace"];
      if (aNormalFace) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsFlat);
        crc3.enableVertexAttribArray(aNormalFace);
        RenderWebGL.setAttributeStructure(aNormalFace, Mesh.getBufferSpecification());
      }

      let aNormalVertex: number = _shader.attributes["a_normalVertex"];
      if (aNormalVertex) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsVertex);
        crc3.enableVertexAttribArray(aNormalVertex);
        RenderWebGL.setAttributeStructure(aNormalVertex, Mesh.getBufferSpecification());
      }

      // feed in texture coordinates if shader accepts a_textureUVs
      let aTextureUVs: number = _shader.attributes["a_textureUVs"];
      if (aTextureUVs) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVs);
        crc3.enableVertexAttribArray(aTextureUVs); // enable the buffer
        crc3.vertexAttribPointer(aTextureUVs, 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      // feed in an id of the node if shader accepts u_id. Used for picking
      let uId: WebGLUniformLocation = _shader.uniforms["u_id"];
      if (uId)
        RenderWebGL.getRenderingContext().uniform1i(uId, _id);
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      // console.log("deleteRenderBuffers", this);
      // return;
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (_renderBuffers) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.vertices);
        crc3.deleteBuffer(_renderBuffers.textureUVs);
        crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.indices);
      }
    }
  }
}