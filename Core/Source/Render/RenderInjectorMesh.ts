namespace FudgeCore {
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
      // console.log("createRenderBuffers", this);
      // return;

      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();
      let vertices: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, vertices);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.vertices, WebGL2RenderingContext.STATIC_DRAW);

      let indices: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, indices);
      crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.indices, WebGL2RenderingContext.STATIC_DRAW);

      let textureUVs: WebGLBuffer = crc3.createBuffer();
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, textureUVs);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.textureUVs, WebGL2RenderingContext.STATIC_DRAW);

      let normalsFace: WebGLBuffer = RenderOperator.assert<WebGLBuffer>(crc3.createBuffer());
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

    protected static useRenderBuffers(this: Mesh, _renderShader: RenderShader, _world: Matrix4x4, _projection: Matrix4x4): void {
      // console.log("useRenderBuffers", this);
      // return;
      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();

      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.vertices);
      crc3.enableVertexAttribArray(_renderShader.attributes["a_position"]);
      RenderOperator.setAttributeStructure(_renderShader.attributes["a_position"], Mesh.getBufferSpecification());

      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.indices);

      if (_renderShader.attributes["a_textureUVs"]) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.textureUVs);
        crc3.enableVertexAttribArray(_renderShader.attributes["a_textureUVs"]); // enable the buffer
        crc3.vertexAttribPointer(_renderShader.attributes["a_textureUVs"], 2, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }
      // Supply matrixdata to shader. 
      let uProjection: WebGLUniformLocation = _renderShader.uniforms["u_projection"];
      crc3.uniformMatrix4fv(uProjection, false, _projection.get());

      if (_renderShader.uniforms["u_world"]) {
        let uWorld: WebGLUniformLocation = _renderShader.uniforms["u_world"];
        crc3.uniformMatrix4fv(uWorld, false, _world.get());

        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.normalsFace);
        crc3.enableVertexAttribArray(_renderShader.attributes["a_normal"]);
        RenderOperator.setAttributeStructure(_renderShader.attributes["a_normal"], Mesh.getBufferSpecification());
      }
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      // console.log("deleteRenderBuffers", this);
      // return;
      let crc3: WebGL2RenderingContext = RenderOperator.getRenderingContext();
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