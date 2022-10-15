namespace FudgeCore {
  export class RenderInjectorMeshSkin extends RenderInjectorMesh {

    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffers", {
        value: RenderInjectorMeshSkin.useRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "getRenderBuffers", {
        value: RenderInjectorMeshSkin.getRenderBuffers
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffers", {
        value: RenderInjectorMeshSkin.deleteRenderBuffers
      });
    }

    protected static getRenderBuffers(this: MeshSkin, _shader: typeof Shader): RenderBuffers {
      let renderBuffers: RenderBuffers = super.getRenderBuffers.call(this, _shader);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      let iBones: Uint8Array = this.renderMesh.iBones;
      let weights: Float32Array = this.renderMesh.weights;
      if (_shader.define.includes("FLAT")) {
        iBones = this.renderMesh.iBonesFlat;
        weights = this.renderMesh.weightsFlat;
      }
      renderBuffers.iBones = RenderWebGL.assert(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.iBones);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, iBones, WebGL2RenderingContext.STATIC_DRAW);

      renderBuffers.weights = RenderWebGL.assert(crc3.createBuffer());
      crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
      crc3.bufferData(WebGL2RenderingContext.ARRAY_BUFFER, weights, WebGL2RenderingContext.STATIC_DRAW);

      return renderBuffers;
    }

    protected static useRenderBuffers(this: MeshSkin, _shader: typeof Shader, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers {
      let renderBuffers: RenderBuffers = super.useRenderBuffers.call(this, _shader, _mtxMeshToWorld, _mtxMeshToView, _id);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      const aIBone: number = _shader.attributes["a_iBone"];
      if (aIBone) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.iBones);
        crc3.enableVertexAttribArray(aIBone);
        crc3.vertexAttribIPointer(aIBone, 4, WebGL2RenderingContext.UNSIGNED_BYTE, 0, 0);
      }

      const aWeight: number = _shader.attributes["a_fWeight"];
      if (aWeight) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, renderBuffers.weights);
        crc3.enableVertexAttribArray(aWeight);
        crc3.vertexAttribPointer(aWeight, 4, WebGL2RenderingContext.FLOAT, false, 0, 0);
      }

      _mtxBones.forEach((mtxBone, iBone) => {
        const uMtxBone: WebGLUniformLocation = _shader.uniforms[`u_bones[${iBone}].matrix`];
        if (uMtxBone)
          crc3.uniformMatrix4fv(uMtxBone, false, mtxBone.get());
      });

      return renderBuffers;
    }

    protected static deleteRenderBuffers(_renderBuffers: RenderBuffers): void {
      super.deleteRenderBuffers(_renderBuffers);
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (_renderBuffers) {
        crc3.bindBuffer(WebGL2RenderingContext.ARRAY_BUFFER, null);
        crc3.deleteBuffer(_renderBuffers.iBones);
        crc3.deleteBuffer(_renderBuffers.weights);
      }
    }

  }
}