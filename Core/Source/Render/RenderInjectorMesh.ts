namespace FudgeCore {
  export interface RenderBuffers {
    vertices: WebGLBuffer;
    indices: WebGLBuffer;
    nIndices: number;
    textureUVs: WebGLBuffer;
    normalsFace: WebGLBuffer;
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

      let normalsFace: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, normalsFace);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.normalsFace, WebGL2RenderingContext.STATIC_DRAW);

      let renderBuffers: RenderBuffers = {
        vertices: vertices,
        indices: indices,
        nIndices: this.getIndexCount(),
        textureUVs: textureUVs,
        normalsFace: normalsFace
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

      let aNormal: number = _shader.attributes["a_normal"];
      if (aNormal) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsFace);
        crc3.enableVertexAttribArray(aNormal);
        RenderWebGL.setAttributeStructure(aNormal, Mesh.getBufferSpecification());
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