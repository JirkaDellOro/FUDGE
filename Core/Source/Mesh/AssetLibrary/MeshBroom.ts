namespace FudgeCore {

  export class MeshBroom extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshBroom);

    private headLength: number= 0;
    private headWidth: number = 0;
    private shaftLength: number = 0;
    
    
    public constructor(_name: string = "MeshBroom", _headLength: number = 0, _headWidth: number= 0, _shaftLength: number = 0) {
      super(_name); 
      this.create(_headLength, _headWidth,_shaftLength);
      
    }
       
    public create(_headLength: number, _headWidth: number,_shaftLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
          new Vertex(new Vector3(-0.029871, 0.428565, 0.034611), new Vector2(0.375000, 0.000000)),
          new Vertex(new Vector3(-0.029871, 0.428565, -0.024738), new Vector2(0.375000, 1.000000)),
          new Vertex(new Vector3(0.029478, 0.428565, 0.034611), new Vector2(0.375000, 0.250000)),
          new Vertex(new Vector3(0.029478, 0.428565, -0.024738), new Vector2(0.375000, 0.750000)),
          new Vertex(new Vector3(-0.000196, 0.428565, -0.039576), new Vector2(0.375000, 0.500000)),
          new Vertex(new Vector3(-0.000196, 0.428565, 0.049448), new Vector2(0.375000, 0.375000)),
          new Vertex(new Vector3(-0.044708, 0.428565, 0.004936), new Vector2(0.375000, 0.875000)),
          new Vertex(new Vector3(0.044316, 0.428565, 0.004936), new Vector2(0.375000, 0.125000)),
          new Vertex(new Vector3(-0.029871, -0.798685 - (this.shaftLength/2), 0.034611), new Vector2(0.375000, 0.625000)),
          new Vertex(new Vector3(-0.029871, -0.798685 - (this.shaftLength/2), -0.024738), new Vector2(0.375000, 0.000000)),
          new Vertex(new Vector3(0.029478, -0.798685 - (this.shaftLength/2), 0.034611), new Vector2(0.125000, 0.750000)),
          new Vertex(new Vector3(0.029478, -0.798685 - (this.shaftLength/2), -0.024738), new Vector2(0.375000, 1.000000)),
          new Vertex(new Vector3(-0.000196, -0.798685 - (this.shaftLength/2), -0.039576), new Vector2(0.125000, 0.500000)),
          new Vertex(new Vector3(-0.000196, -0.798685 - (this.shaftLength/2), 0.049448), new Vector2(0.375000, 0.250000)),
          new Vertex(new Vector3(-0.044708, -0.798685 - (this.shaftLength/2), 0.004936), new Vector2(0.375000, 0.750000)),
          new Vertex(new Vector3(0.044316, -0.798685 - (this.shaftLength/2), 0.004936), new Vector2(0.375000, 0.500000)),
          new Vertex(new Vector3(-0.000196, -0.824413 - (this.shaftLength/2), 0.004936), new Vector2(0.250000, 0.500000)),
          new Vertex(new Vector3(-0.508497 - (this.headLength/2), 0.428565, 0.064658 + (this.headWidth/2)), new Vector2(0.375000, 0.375000)),
          new Vertex(new Vector3(-0.508497 - (this.headLength/2), 0.517779, 0.064658 + (this.headWidth/2)) , new Vector2(0.250000, 0.750000)),
          new Vertex(new Vector3(-0.508497 - (this.headLength/2), 0.428565, -0.054786 - (this.headWidth/2)), new Vector2(0.375000, 0.875000)),
          new Vertex(new Vector3(-0.508497 - (this.headLength/2), 0.517779, -0.116488 - (this.headWidth/2)), new Vector2(0.125000, 0.625000)),
          new Vertex(new Vector3(0.509331 + (this.headLength/2), 0.428565, 0.064658 + (this.headWidth/2)), new Vector2(0.375000, 0.125000)),
          new Vertex(new Vector3(0.509331 + (this.headLength/2), 0.517779, 0.064658 + (this.headWidth/2)), new Vector2(0.375000, 0.625000)),
          new Vertex(new Vector3(0.509331 + (this.headLength/2), 0.428565, -0.054786 - (this.headWidth/2)), new Vector2(0.250000, 0.625000)),
          new Vertex(new Vector3(0.509331 + (this.headLength/2), 0.517779, -0.116488 - (this.headWidth/2)), new Vector2(0.375000, 0.000000))
        
      );
        this.faces = [
          new Face(this.vertices, 6, 8, 0),
          new Face(this.vertices, 2, 15, 7),
          new Face(this.vertices, 4, 9, 1),
          new Face(this.vertices, 5, 10, 2),
          new Face(this.vertices, 16, 10, 13),
          new Face(this.vertices, 16, 8, 14),
          new Face(this.vertices, 9, 16, 14),
          new Face(this.vertices, 11, 16, 12),
          new Face(this.vertices, 1, 14, 6),
          new Face(this.vertices, 7, 11, 3),
          new Face(this.vertices, 0, 13, 5),
          new Face(this.vertices, 3, 12, 4),
          new Face(this.vertices, 18, 19, 17),
          new Face(this.vertices, 20, 23, 19),
          new Face(this.vertices, 23, 22, 21),
          new Face(this.vertices, 22, 17, 21),
          new Face(this.vertices, 23, 17, 19),
          new Face(this.vertices, 20, 22, 24),
          new Face(this.vertices, 6, 14, 8),
          new Face(this.vertices, 2, 10, 15),
          new Face(this.vertices, 4, 12, 9),
          new Face(this.vertices, 5, 13, 10),
          new Face(this.vertices, 16, 15, 10),
          new Face(this.vertices, 16, 13, 8),
          new Face(this.vertices, 9, 12, 16),
          new Face(this.vertices, 11, 15, 16),
          new Face(this.vertices, 1, 9, 14),
          new Face(this.vertices, 7, 15, 11),
          new Face(this.vertices, 0, 8, 13),
          new Face(this.vertices, 3, 11, 12),
          new Face(this.vertices, 18, 20, 19),
          new Face(this.vertices, 20, 24, 23),
          new Face(this.vertices, 23, 24, 22),
          new Face(this.vertices, 22, 18, 17),
          new Face(this.vertices, 23, 21, 17),
          new Face(this.vertices, 20, 18, 22)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.headLength = this.headLength
      serialization.headWidth = this.headWidth;
      serialization.shaftLength = this.shaftLength
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.headLength = _serialization.headLength;
      this.headWidth = _serialization.headWidth;
      this.shaftLength = _serialization.shaftLength
      this.create(this.headLength, this.headWidth,this.shaftLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.headLength, this.headWidth, this.shaftLength);
    }
    
  }
}