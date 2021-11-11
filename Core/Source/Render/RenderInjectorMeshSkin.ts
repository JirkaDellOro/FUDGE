namespace FudgeCore {
  export class RenderInjectorMeshSkin {

    protected static createRenderBuffers(this: MeshSkin): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      this.renderBuffers.iBones = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.iBones);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, this.iBones, WebGL2RenderingContext.STATIC_DRAW);

      this.renderBuffers.weights = RenderWebGL.assert<WebGLBuffer>(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.renderBuffers.weights);
      crc3.bufferData(WebGL2RenderingContext.ELEMENT_ARRAY_BUFFER, this.weights, WebGL2RenderingContext.STATIC_DRAW);
    }

    protected static useRenderBuffers(this: MeshSkin, _shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const aIBone: number = _shader.attributes["a_iBone"];
      if (aIBone) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.iBones);
        crc3.enableVertexAttribArray(aIBone);
        crc3.vertexAttribPointer(aIBone, 4, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      const aWeight: number = _shader.attributes["a_weight"];
      if (aWeight) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, this.renderBuffers.weights);
        crc3.enableVertexAttribArray(aWeight);
        crc3.vertexAttribPointer(aWeight, 4, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      const uMtxBones: WebGLUniformLocation = _shader.uniforms["u_mtxBones"];
      if (uMtxBones)
        crc3.uniformMatrix4fv(uMtxBones, false, this.mtxBones);
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      
      if (_renderBuffers) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.iBones);
        crc3.deleteBuffer(_renderBuffers.weights);
      }
    }

  }
}