namespace FudgeCore {  

  export class MeshSword extends MeshMutable {    
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshSword);
    private bladeLength: number = 0;
    private bladeWidth: number = 0; 
    private handleWidth: number = 0;
    

    public constructor(_name: string = "MeshSword", _bladeLength: number= 0, _bladeWidth: number = 0, _handleWidth: number= 0, _controllNumber: number = 0) {
      super(_name); 
      this.create(_bladeLength, _bladeWidth, _handleWidth);
      
    }
       
    public create(_bladeLength: number, _bladeWidth: number, _handleWidth: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.291853, -0.160000, 3.273520), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(-0.291853, 0.160000, 3.273520), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.291853, -0.160000, 2.762494), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-0.291853, 0.160000, 2.762494), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.291853, -0.160000, 3.273520), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(0.291853, 0.160000, 3.273520), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.291853, -0.160000, 2.762494), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(0.291853, 0.160000, 2.762494), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(-0.200000, -0.100000, 2.962494), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.200000, 0.100000, 2.962494), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(-0.200000, -0.100000, 0.962494), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.200000, 0.100000, 0.962494), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.200000, -0.100000, 2.962494), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.200000, 0.100000, 2.962494), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(0.200000, -0.100000, 0.962494), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(0.200000, 0.100000, 0.962494), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-1.143185 - _handleWidth, -0.132427, 0.685987), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-1.143185 - _handleWidth, 0.132427, 0.685987), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(-1.143185 - _handleWidth, -0.132427, 0.220012), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(-1.143185 - _handleWidth, 0.132427, 0.220012), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(1.143185 + _handleWidth, -0.132427, 0.685987), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(1.143185 + _handleWidth, 0.132427, 0.685987), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(1.143185 + _handleWidth, -0.132427, 0.220012), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(1.143185 + _handleWidth, 0.132427, 0.220012), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(-0.000000, -0.132427, 0.729506), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.000000, 0.132427, 0.729506), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(-0.000000, -0.132427, 1.195481), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(-0.000000, 0.132427, 1.195481), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(-0.334896 - _bladeWidth, -0.055335, 0.723503), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(-0.334896 - _bladeWidth, 0.055335, 0.723503), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.334896 - _bladeWidth, -0.015471, -8.276497 - _bladeLength), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-0.334896 - _bladeWidth, 0.015471, -8.276497 - _bladeLength), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.334896 + _bladeWidth, -0.055335, 0.723503), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(0.334896 + _bladeWidth, 0.055335, 0.723503), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.334896 + _bladeWidth, -0.015471, -8.276497 - _bladeLength), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(0.334896 + _bladeWidth, 0.015471, -8.276497 - _bladeLength), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(-0.000000, -0.015471, -9.276497 - _bladeLength), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(-0.000000, 0.015471, -9.276497 - _bladeLength), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.000000, -0.055335, 0.723503), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.000000, 0.055335, 0.723503), new Vector2(0.625000, 0.750000))
        
      );
      
        this.faces = [
        new Face(this.vertices, 1, 2, 0),
        new Face(this.vertices, 3, 6, 2),
        new Face(this.vertices, 7, 4, 6),
        new Face(this.vertices, 5, 0, 4),
        new Face(this.vertices, 6, 0, 2),
        new Face(this.vertices, 3, 5, 7),
        new Face(this.vertices, 9, 10, 8),
        new Face(this.vertices, 11, 14, 10),
        new Face(this.vertices, 15, 12, 14),
        new Face(this.vertices, 13, 8, 12),
        new Face(this.vertices, 14, 8, 10),
        new Face(this.vertices, 11, 13, 15),
        new Face(this.vertices, 17, 18, 16),
        new Face(this.vertices, 25, 22, 24),
        new Face(this.vertices, 23, 20, 22),
        new Face(this.vertices, 27, 16, 26),
        new Face(this.vertices, 24, 20, 26),
        new Face(this.vertices, 25, 17, 27),
        new Face(this.vertices, 25, 21, 23),
        new Face(this.vertices, 24, 16, 18),
        new Face(this.vertices, 21, 26, 20),
        new Face(this.vertices, 19, 24, 18),
        new Face(this.vertices, 29, 30, 28),
        new Face(this.vertices, 37, 34, 36),
        new Face(this.vertices, 35, 32, 34),
        new Face(this.vertices, 39, 28, 38),
        new Face(this.vertices, 34, 38, 36),
        new Face(this.vertices, 31, 39, 37),
        new Face(this.vertices, 35, 39, 33),
        new Face(this.vertices, 30, 38, 28),
        new Face(this.vertices, 33, 38, 32),
        new Face(this.vertices, 31, 36, 30),
        new Face(this.vertices, 1, 3, 2),
        new Face(this.vertices, 3, 7, 6),
        new Face(this.vertices, 7, 5, 4),
        new Face(this.vertices, 5, 1, 0),
        new Face(this.vertices, 6, 4, 0),
        new Face(this.vertices, 3, 1, 5),
        new Face(this.vertices, 9, 11, 10),
        new Face(this.vertices, 11, 15, 14),
        new Face(this.vertices, 15, 13, 12),
        new Face(this.vertices, 13, 9, 8),
        new Face(this.vertices, 14, 12, 8),
        new Face(this.vertices, 11, 9, 13),
        new Face(this.vertices, 17, 19, 18),
        new Face(this.vertices, 25, 23, 22),
        new Face(this.vertices, 23, 21, 20),
        new Face(this.vertices, 27, 17, 16),
        new Face(this.vertices, 24, 22, 20),
        new Face(this.vertices, 25, 19, 17),
        new Face(this.vertices, 25, 27, 21),
        new Face(this.vertices, 24, 26, 16),
        new Face(this.vertices, 21, 27, 26),
        new Face(this.vertices, 19, 25, 24),
        new Face(this.vertices, 29, 31, 30),
        new Face(this.vertices, 37, 35, 34),
        new Face(this.vertices, 35, 33, 32),
        new Face(this.vertices, 39, 29, 28),
        new Face(this.vertices, 34, 32, 38),
        new Face(this.vertices, 31, 29, 39),
        new Face(this.vertices, 35, 37, 39),
        new Face(this.vertices, 30, 36, 38),
        new Face(this.vertices, 33, 39, 38),
        new Face(this.vertices, 31, 37, 36)

      ];
        
    }
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.bladeLength = this.bladeLength;
      serialization.bladeWidth = this.bladeWidth;
      serialization.handleWidth = this.handleWidth;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.bladeLength = _serialization.bladeLength;
      this.bladeWidth = _serialization.bladeWidth;
      this.handleWidth = _serialization.handleWidth;
      this.create(this.bladeLength, this.bladeWidth, this.handleWidth);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.bladeLength, this.bladeWidth, this.handleWidth);
    }
    
  }
}