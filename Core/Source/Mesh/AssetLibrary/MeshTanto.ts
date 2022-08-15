namespace FudgeCore {
  export class MeshTanto extends MeshMutable {
    public static readonly iSubclass: number =MeshMutable.registerSubclass(MeshTanto);

    private sharpness: number = 0;
    
    public constructor(_name: string = "MeshTanto", _sharpness: number= 0) {
      super(_name); 
      this.create(_sharpness);
      
    } 
       
    public create(_sharpness: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.120339, 0.048774, -0.094342), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(-0.120339, -0.048774, -0.094342), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.120339, 0.010164 - (_sharpness / 10), -2.568180), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-0.120339, -0.010164, -2.568180), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(0.120339, 0.048774 - (_sharpness / 10), -0.094342), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(0.120339, -0.048774, -0.094342), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.120339, 0.010164 - (_sharpness / 10), -2.094342), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(0.120339, -0.010164, -2.094342), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(-0.205944, 0.126739, 1.025162), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(-0.205944, -0.126739, 1.025162), new Vector2(0.875000, 0.500000)),
        new Vertex(new Vector3(-0.205944, 0.126739, 0.820946), new Vector2(0.375000, 0.750000)),
        new Vertex(new Vector3(-0.205944, -0.126739, 0.820946), new Vector2(0.625000, 0.750000)),
        new Vertex(new Vector3(0.205944, 0.126739, 1.025162), new Vector2(0.375000, 0.500000)),
        new Vertex(new Vector3(0.205944, -0.126739, 1.025162), new Vector2(0.625000, 0.500000)),
        new Vertex(new Vector3(0.205944, 0.126739, 0.820946), new Vector2(0.375000, 0.000000)),
        new Vertex(new Vector3(0.205944, -0.126739, 0.820946), new Vector2(0.375000, 1.000000)),
        new Vertex(new Vector3(-0.174633, -0.100000, 0.889746), new Vector2(0.125000, 0.750000)),
        new Vertex(new Vector3(-0.174633, 0.100000, 0.889746), new Vector2(0.625000, 0.000000)),
        new Vertex(new Vector3(-0.174633, -0.100000, -0.310254), new Vector2(0.625000, 1.000000)),
        new Vertex(new Vector3(-0.174633, 0.100000, -0.310254), new Vector2(0.875000, 0.750000)),
        new Vertex(new Vector3(0.174633, -0.100000, 0.889746), new Vector2(0.125000, 0.500000)),
        new Vertex(new Vector3(0.174633, 0.100000, 0.889746), new Vector2(0.375000, 0.250000)),
        new Vertex(new Vector3(0.174633, -0.100000, -0.310254), new Vector2(0.625000, 0.250000)),
        new Vertex(new Vector3(0.174633, 0.100000, -0.310254), new Vector2(0.875000, 0.500000))
        
      );
        this.faces = [
        new Face(this.vertices, 0, 2, 3),
        new Face(this.vertices, 3, 2, 6),
        new Face(this.vertices, 7, 6, 4),
        new Face(this.vertices, 5, 4, 0),
        new Face(this.vertices, 6, 2, 0),
        new Face(this.vertices, 7, 5, 1),
        new Face(this.vertices, 9, 8, 10),
        new Face(this.vertices, 11, 10, 14),
        new Face(this.vertices, 15, 14, 12),
        new Face(this.vertices, 13, 12, 8),
        new Face(this.vertices, 14, 10, 8),
        new Face(this.vertices, 11, 15, 13),
        new Face(this.vertices, 17, 18, 16),
        new Face(this.vertices, 19, 22, 18),
        new Face(this.vertices, 23, 20, 22),
        new Face(this.vertices, 21, 16, 20),
        new Face(this.vertices, 22, 16, 18),
        new Face(this.vertices, 19, 21, 23),
        new Face(this.vertices, 0, 3, 1),
        new Face(this.vertices, 3, 6, 7),
        new Face(this.vertices, 7, 4, 5),
        new Face(this.vertices, 5, 0, 1),
        new Face(this.vertices, 6, 0, 4),
        new Face(this.vertices, 7, 1, 3),
        new Face(this.vertices, 9, 10, 11),
        new Face(this.vertices, 11, 14, 15),
        new Face(this.vertices, 15, 12, 13),
        new Face(this.vertices, 13, 8, 9),
        new Face(this.vertices, 14, 8, 12),
        new Face(this.vertices, 11, 13, 9),
        new Face(this.vertices, 17, 19, 18),
        new Face(this.vertices, 19, 23, 22),
        new Face(this.vertices, 23, 21, 20),
        new Face(this.vertices, 21, 17, 16),
        new Face(this.vertices, 22, 20, 16),
        new Face(this.vertices, 19, 17, 21)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.sharpness = this.sharpness;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.sharpness = _serialization.sharpness;
      this.create(this.sharpness);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.sharpness);
    }
    
  }
}