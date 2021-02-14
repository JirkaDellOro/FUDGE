namespace FudgeCore {
  export class Pick {
    // public face: number;
    public node: Node;
    public zBuffer: number;
    public luminance: number;
    public alpha: number;
    #mtxViewToWorld: Matrix4x4;
    #posWorld: Vector3;
    #posMesh: Vector3;

    constructor(_node: Node) {
      this.node = _node;
    }

    public get posWorld(): Vector3 {
      if (this.#posWorld)
        return this.#posWorld;
      let pointInClipSpace: Vector3 = Vector3.Z(this.zBuffer);
      let m: Float32Array = this.#mtxViewToWorld.get();
      let result: Vector3 = Vector3.TRANSFORMATION(pointInClipSpace, this.#mtxViewToWorld, true);
      let w: number = m[3] * pointInClipSpace.x + m[7] * pointInClipSpace.y + m[11] * pointInClipSpace.z + m[15];
      result.scale(1 / w);

      this.#posWorld = result;
      return result;
    }

    public get posMesh(): Vector3 {
      if (this.#posMesh)
        return this.#posMesh;
      // console.log(this.node.getComponent(ComponentMesh).mtxWorld.toString());
      let mtxWorldToMesh: Matrix4x4 = Matrix4x4.INVERSION(this.node.getComponent(ComponentMesh).mtxWorld);
      let posMesh: Vector3 = Vector3.TRANSFORMATION(this.posWorld, mtxWorldToMesh);
      this.#posMesh = posMesh;
      return posMesh;
    }

    public get normal(): Vector3 {
      let cmpMesh: ComponentMesh = this.node.getComponent(ComponentMesh);
      let mesh: Mesh = cmpMesh.mesh;
      let normal: Vector3 = Vector3.ZERO();
      let vertex: Vector3 = Vector3.ZERO();
      let minDistance: number = Infinity;
      let result: Vector3;

      for (let i: number = 2; i < mesh.indices.length; i += 3) {
        let iVertex: number = mesh.indices[i];
        let [x, y, z] = mesh.vertices.subarray(iVertex * 3, (iVertex + 1) * 3);
        vertex.set(x, y, z);
        [x, y, z] = mesh.normalsFace.subarray(iVertex * 3, (iVertex + 1) * 3);
        normal.set(x, y, z);
        // console.log(i, iVertex, normal.toString());

        let difference: Vector3 = Vector3.DIFFERENCE(this.posMesh, vertex);
        let distance: number = Math.abs(Vector3.DOT(normal, difference));
        if (distance < minDistance) {
          result = normal.copy;
          minDistance = distance;
        }
      }

      result.transform(cmpMesh.mtxWorld, false);
      return result;
    }

    /**
     * Called solely by the renderer to enable calculation of the world coordinates of this [[Pick]]
     */
    public set mtxViewToWorld(_mtxViewToWorld: Matrix4x4) {
      this.#mtxViewToWorld = _mtxViewToWorld;
    }
  }
}