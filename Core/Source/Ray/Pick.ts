namespace FudgeCore {
  /**
   * Stores information provided by {@link Render}-picking e.g. using {@link Picker} and provides methods for further calculation of positions and normals etc.
   * 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class Pick {
    public node: Node;
    public zBuffer: number;
    public color: Color;
    public textureUV: Vector2;
    #mtxViewToWorld: Matrix4x4;
    #posWorld: Vector3;
    #posMesh: Vector3;

    constructor(_node: Node) {
      this.node = _node;
    }

    /**
     * Accessor to calculate and store world position of intersection of {@link Ray} and {@link Mesh} only when used.
     */
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

    /**
     * Accessor to calculate and store position in mesh-space of intersection of {@link Ray} and {@link Mesh} only when used.
     */
    public get posMesh(): Vector3 {
      if (this.#posMesh)
        return this.#posMesh;
      let mtxWorldToMesh: Matrix4x4 = Matrix4x4.INVERSION(this.node.getComponent(ComponentMesh).mtxWorld);
      let posMesh: Vector3 = Vector3.TRANSFORMATION(this.posWorld, mtxWorldToMesh);
      this.#posMesh = posMesh;
      return posMesh;
    }

    /**
     * Accessor to calculate and store the face normal in world-space at the point of intersection of {@link Ray} and {@link Mesh} only when used.
     */
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

        let difference: Vector3 = Vector3.DIFFERENCE(this.posMesh, vertex);
        let distance: number = Math.abs(Vector3.DOT(normal, difference));
        if (distance < minDistance) {
          result = normal.clone;
          minDistance = distance;
        }
      }

      result.transform(cmpMesh.mtxWorld, false);
      result.normalize();
      return result;
    }

    /**
     * Called solely by the renderer to enable calculation of the world coordinates of this {@link Pick}
     */
    public set mtxViewToWorld(_mtxViewToWorld: Matrix4x4) {
      this.#mtxViewToWorld = _mtxViewToWorld;
    }
  }
}