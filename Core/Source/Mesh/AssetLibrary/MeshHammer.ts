namespace FudgeCore {
  export class MeshHammer extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshHammer);

    private hammerHeadPitch: number = 0;
    private shaftLength: number = 0;
    
    public constructor(_name: string = "MeshHammer", _hammerHeadPitch: number= 0, _shaftLength: number = 0) {
      super(_name); 
      this.create(_hammerHeadPitch,_shaftLength);
      
    }
       
    public create(_hammerHeadPitch: number,_shaftLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(-0.133821, 0.066911, -0.065795), new Vector2(0.126582, 0.443038)),
        new Vertex(new Vector3(-0.133821, 0.200732, -0.065795), new Vector2(0.189873, 0.443038)),
        new Vertex(new Vector3(0.089214 + (_hammerHeadPitch/2), 0.200732, -0.065795), new Vector2(0.563291, 0.000000)),
        new Vertex(new Vector3(0.178428, 0.066911, -0.065795), new Vector2(0.126582, 0.632911)),
        new Vertex(new Vector3(-0.133821, 0.200732, 0.063565), new Vector2(0.000000, 0.443038)),
        new Vertex(new Vector3(-0.133821, 0.066911, 0.063565), new Vector2(0.746835, 0.403737)),
        new Vertex(new Vector3(0.178428, 0.066911, 0.063565), new Vector2(0.000000, 0.126582)),
        new Vertex(new Vector3(0.089214 + (_hammerHeadPitch/2), 0.200732, 0.063565), new Vector2(0.746835, 0.228199)),
        new Vertex(new Vector3(0.044607, 0.066911, -0.043492), new Vector2(0.189873, 0.000000)),
        new Vertex(new Vector3(0.044607, -0.334553 - (_shaftLength/2), -0.043492), new Vector2(0.746835, 0.000000)),
        new Vertex(new Vector3(0.044607, 0.066911, 0.045722), new Vector2(0.563291, 0.443038)),
        new Vertex(new Vector3(0.044607, -0.334553 - (_shaftLength/2), 0.045722), new Vector2(0.310127, 0.632911)),
        new Vertex(new Vector3(-0.044607, 0.066911, -0.043492), new Vector2(0.379747, 0.443038)),
        new Vertex(new Vector3(-0.044607, -0.334553 - (_shaftLength/2), -0.043492), new Vector2(0.563291, 0.403737)),
        new Vertex(new Vector3(-0.044607, 0.066911, 0.045722), new Vector2(0.379747, 0.000000)),
        new Vertex(new Vector3(-0.044607, -0.334553 - (_shaftLength/2), 0.045722), new Vector2(0.310127, 0.443038))
        
      );
        this.faces = [
        new Face(this.vertices, 1, 5, 4),
        new Face(this.vertices, 0, 2, 3),
        new Face(this.vertices, 5, 7, 4),
        new Face(this.vertices, 7, 1, 4),
        new Face(this.vertices, 7, 3, 2),
        new Face(this.vertices, 0, 6, 5),
        new Face(this.vertices, 10, 15, 11),
        new Face(this.vertices, 14, 13, 15),
        new Face(this.vertices, 9, 15, 13),
        new Face(this.vertices, 8, 11, 9),
        new Face(this.vertices, 12, 9, 13),
        new Face(this.vertices, 1, 0, 5),
        new Face(this.vertices, 0, 1, 2),
        new Face(this.vertices, 5, 6, 7),
        new Face(this.vertices, 7, 2, 1),
        new Face(this.vertices, 7, 6, 3),
        new Face(this.vertices, 0, 3, 6),
        new Face(this.vertices, 10, 14, 15),
        new Face(this.vertices, 14, 12, 13),
        new Face(this.vertices, 9, 11, 15),
        new Face(this.vertices, 8, 10, 11),
        new Face(this.vertices, 12, 8, 9)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.hammerHeadPitch = this.hammerHeadPitch;
      serialization.shaftLength = this.shaftLength
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.hammerHeadPitch = _serialization.hammerHeadPitch;
      this.shaftLength = _serialization.shaftLength
      this.create(this.hammerHeadPitch,this.shaftLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.hammerHeadPitch, this.shaftLength);
    }
    
  }
}