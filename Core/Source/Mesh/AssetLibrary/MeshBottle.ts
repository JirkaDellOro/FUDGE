namespace FudgeCore {
  export class MeshBottle extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshBottle);

    private bottleBodyLength: number = 0;
    private bottleNeckLength: number = 0;
    
    public constructor(_name: string = "MeshBottle", _bottleBodyLength: number= 0, _bottleNeckLength: number = 0) {
      super(_name); 
      this.create(_bottleBodyLength, _bottleNeckLength);
      
    }
       
    public create(_bottleBodyLength: number, _bottleNeckLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(0.012992, 0.103499 + _bottleNeckLength, -0.012992), new Vector2(0.915352, 0.896593)),
        new Vertex(new Vector3(0.017532, 0.036547, -0.017532), new Vector2(0.766071, 0.838747)),
        new Vertex(new Vector3(0.012992, 0.103499 + _bottleNeckLength, 0.012992), new Vector2(0.109711, 0.778165)),
        new Vertex(new Vector3(0.017532, 0.036547, 0.017532), new Vector2(0.691779, 0.598678)),
        new Vertex(new Vector3(-0.012992, 0.103499 + _bottleNeckLength, -0.012992), new Vector2(0.909514, 0.747636)),
        new Vertex(new Vector3(-0.017532, 0.036547, -0.017532), new Vector2(0.817778, 0.812894)),
        new Vertex(new Vector3(-0.012992, 0.103499 + _bottleNeckLength, 0.012992), new Vector2(0.691779, 0.747636)),
        new Vertex(new Vector3(-0.017532, 0.036547, 0.017532), new Vector2(0.179486, 0.813052)),
        new Vertex(new Vector3(0.000000, 0.036547, -0.026297), new Vector2(0.740218, 0.787040)),
        new Vertex(new Vector3(0.000000, 0.103499 + _bottleNeckLength, 0.019488), new Vector2(0.857182, 0.896593)),
        new Vertex(new Vector3(0.000000, 0.036547, 0.026297), new Vector2(0.770276, 0.598678)),
        new Vertex(new Vector3(0.000000, 0.103499 + _bottleNeckLength, -0.019488), new Vector2(0.144599, 0.708390)),
        new Vertex(new Vector3(-0.026297, 0.036547, 0.000000), new Vector2(0.791925, 0.761187)),
        new Vertex(new Vector3(0.019488, 0.103499 + _bottleNeckLength, 0.000000), new Vector2(0.967683, 0.747636)),
        new Vertex(new Vector3(-0.019488, 0.103499 + _bottleNeckLength, 0.000000), new Vector2(0.848773, 0.598678)),
        new Vertex(new Vector3(0.026297, 0.036547, 0.000000), new Vector2(0.214374, 0.743278)),
        new Vertex(new Vector3(0.054286, -0.260586 - _bottleBodyLength, -0.054286), new Vector2(0.726667, 0.598678)),
        new Vertex(new Vector3(0.054286, 0.008500, -0.054286), new Vector2(0.109711, 0.734556)),
        new Vertex(new Vector3(0.054286, 0.008500, 0.054286), new Vector2(0.941830, 0.747636)),
        new Vertex(new Vector3(-0.054286, 0.008500, -0.054286), new Vector2(0.817778, 0.780577)),
        new Vertex(new Vector3(-0.054286, 0.008500, 0.054286), new Vector2(0.883660, 0.598678)),
        new Vertex(new Vector3(0.000000, 0.008500, -0.081430), new Vector2(0.648170, 0.747636)),
        new Vertex(new Vector3(0.000000, 0.008500, 0.081430), new Vector2(0.214374, 0.786887)),
        new Vertex(new Vector3(-0.081430, 0.008500, 0.000000), new Vector2(0.740218, 0.819357)),
        new Vertex(new Vector3(0.081430, 0.008500, 0.000000), new Vector2(0.889499, 0.896593)),
        new Vertex(new Vector3(0.054286, -0.260586 - _bottleBodyLength, 0.054286), new Vector2(0.805164, 0.598678)),
        new Vertex(new Vector3(-0.054286, -0.260586 - _bottleBodyLength, -0.054286), new Vector2(0.188208, 0.708390)),
        new Vertex(new Vector3(-0.054286, -0.260586 - _bottleBodyLength, 0.054286), new Vector2(0.947669, 0.896593)),
        new Vertex(new Vector3(0.000000, -0.260586 - _bottleBodyLength, -0.081430), new Vector2(0.798388, 0.838747)),
        new Vertex(new Vector3(0.000000, -0.260586 - _bottleBodyLength, 0.081430), new Vector2(0.883660, 0.747636)),
        new Vertex(new Vector3(-0.081430, -0.260586 - _bottleBodyLength, 0.000000), new Vector2(1.000000, 0.747636)),
        new Vertex(new Vector3(0.081430, -0.260586 - _bottleBodyLength, 0.000000), new Vector2(0.831329, 0.896593)),
        new Vertex(new Vector3(0.000000, -0.260586 - _bottleBodyLength, 0.000000), new Vector2(0.759608, 0.761187)),
        new Vertex(new Vector3(0.000000, 0.103499 + _bottleNeckLength, 0.026297), new Vector2(0.726667, 0.747636)),
        new Vertex(new Vector3(-0.017532, 0.103499 + _bottleNeckLength, 0.017532), new Vector2(0.648170, 0.598678)),
        new Vertex(new Vector3(0.026297, 0.103499 + _bottleNeckLength, 0.000000), new Vector2(0.135877, 0.813052)),
        new Vertex(new Vector3(0.017532, 0.103499 + _bottleNeckLength, 0.017532), new Vector2(0.432114, 0.598679)),
        new Vertex(new Vector3(-0.026297, 0.103499 + _bottleNeckLength, 0.000000), new Vector2(0.621163, 0.000000)),
        new Vertex(new Vector3(-0.017532, 0.103499 + _bottleNeckLength, -0.017532), new Vector2(0.621163, 0.598679)),
        new Vertex(new Vector3(0.000000, 0.103499 + _bottleNeckLength, -0.026297), new Vector2(0.000000, 0.814735)),
        new Vertex(new Vector3(0.017532, 0.103499 + _bottleNeckLength, -0.017532), new Vector2(0.864227, 0.598679)),
        new Vertex(new Vector3(0.012992, 0.036547, -0.012992), new Vector2(0.216057, 0.922764)),
        new Vertex(new Vector3(0.012992, 0.036547, 0.012992), new Vector2(0.108028, 0.598679)),
        new Vertex(new Vector3(-0.012992, 0.036547, -0.012992), new Vector2(0.135035, 0.598679)),
        new Vertex(new Vector3(-0.012992, 0.036547, 0.012992), new Vector2(0.324085, 0.706707)),
        new Vertex(new Vector3(0.000000, 0.036547, 0.019488), new Vector2(0.378099, 0.598679)),
        new Vertex(new Vector3(0.000000, 0.036547, -0.019488), new Vector2(0.729191, 0.598679)),
        new Vertex(new Vector3(0.019488, 0.036547, 0.000000), new Vector2(0.000000, 0.679700)),
        new Vertex(new Vector3(-0.019488, 0.036547, 0.000000), new Vector2(0.000000, 0.598679)),
        new Vertex(new Vector3(0.000000, 0.036547, 0.000000), new Vector2(0.486128, 0.598679))
        
      );
        this.faces = [
        new Face(this.vertices, 9, 44, 6),
        new Face(this.vertices, 33, 7, 10),
        new Face(this.vertices, 37, 5, 12),
        new Face(this.vertices, 8, 17, 21),
        new Face(this.vertices, 35, 3, 15),
        new Face(this.vertices, 39, 1, 8),
        new Face(this.vertices, 38, 8, 5),
        new Face(this.vertices, 15, 18, 24),
        new Face(this.vertices, 36, 10, 3),
        new Face(this.vertices, 14, 43, 4),
        new Face(this.vertices, 2, 45, 9),
        new Face(this.vertices, 10, 20, 22),
        new Face(this.vertices, 40, 15, 1),
        new Face(this.vertices, 12, 19, 23),
        new Face(this.vertices, 34, 12, 7),
        new Face(this.vertices, 0, 47, 13),
        new Face(this.vertices, 23, 27, 20),
        new Face(this.vertices, 22, 25, 18),
        new Face(this.vertices, 17, 28, 21),
        new Face(this.vertices, 18, 31, 24),
        new Face(this.vertices, 8, 19, 5),
        new Face(this.vertices, 10, 18, 3),
        new Face(this.vertices, 12, 20, 7),
        new Face(this.vertices, 15, 17, 1),
        new Face(this.vertices, 32, 25, 29),
        new Face(this.vertices, 32, 27, 30),
        new Face(this.vertices, 26, 32, 30),
        new Face(this.vertices, 16, 32, 28),
        new Face(this.vertices, 19, 30, 23),
        new Face(this.vertices, 20, 29, 22),
        new Face(this.vertices, 24, 16, 17),
        new Face(this.vertices, 21, 26, 19),
        new Face(this.vertices, 9, 34, 33),
        new Face(this.vertices, 13, 36, 35),
        new Face(this.vertices, 14, 38, 37),
        new Face(this.vertices, 11, 40, 39),
        new Face(this.vertices, 9, 36, 2),
        new Face(this.vertices, 11, 38, 4),
        new Face(this.vertices, 13, 40, 0),
        new Face(this.vertices, 14, 34, 6),
        new Face(this.vertices, 49, 44, 45),
        new Face(this.vertices, 49, 42, 47),
        new Face(this.vertices, 41, 49, 47),
        new Face(this.vertices, 43, 49, 46),
        new Face(this.vertices, 6, 48, 14),
        new Face(this.vertices, 4, 46, 11),
        new Face(this.vertices, 11, 41, 0),
        new Face(this.vertices, 13, 42, 2),
        new Face(this.vertices, 9, 45, 44),
        new Face(this.vertices, 33, 34, 7),
        new Face(this.vertices, 37, 38, 5),
        new Face(this.vertices, 8, 1, 17),
        new Face(this.vertices, 35, 36, 3),
        new Face(this.vertices, 39, 40, 1),
        new Face(this.vertices, 38, 39, 8),
        new Face(this.vertices, 15, 3, 18),
        new Face(this.vertices, 36, 33, 10),
        new Face(this.vertices, 14, 48, 43),
        new Face(this.vertices, 2, 42, 45),
        new Face(this.vertices, 10, 7, 20),
        new Face(this.vertices, 40, 35, 15),
        new Face(this.vertices, 12, 5, 19),
        new Face(this.vertices, 34, 37, 12),
        new Face(this.vertices, 0, 41, 47),
        new Face(this.vertices, 23, 30, 27),
        new Face(this.vertices, 22, 29, 25),
        new Face(this.vertices, 17, 16, 28),
        new Face(this.vertices, 18, 25, 31),
        new Face(this.vertices, 8, 21, 19),
        new Face(this.vertices, 10, 22, 18),
        new Face(this.vertices, 12, 23, 20),
        new Face(this.vertices, 15, 24, 17),
        new Face(this.vertices, 32, 31, 25),
        new Face(this.vertices, 32, 29, 27),
        new Face(this.vertices, 26, 28, 32),
        new Face(this.vertices, 16, 31, 32),
        new Face(this.vertices, 19, 26, 30),
        new Face(this.vertices, 20, 27, 29),
        new Face(this.vertices, 24, 31, 16),
        new Face(this.vertices, 21, 28, 26),
        new Face(this.vertices, 9, 6, 34),
        new Face(this.vertices, 13, 2, 36),
        new Face(this.vertices, 14, 4, 38),
        new Face(this.vertices, 11, 0, 40),
        new Face(this.vertices, 9, 33, 36),
        new Face(this.vertices, 11, 39, 38),
        new Face(this.vertices, 13, 35, 40),
        new Face(this.vertices, 14, 37, 34),
        new Face(this.vertices, 49, 48, 44),
        new Face(this.vertices, 49, 45, 42),
        new Face(this.vertices, 41, 46, 49),
        new Face(this.vertices, 43, 48, 49),
        new Face(this.vertices, 6, 44, 48),
        new Face(this.vertices, 4, 43, 46),
        new Face(this.vertices, 11, 46, 41),
        new Face(this.vertices, 13, 47, 42)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.bottleBodyLength = this.bottleBodyLength;
      serialization.bottleNeckLength = this.bottleNeckLength;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.bottleBodyLength = _serialization.bottleBodyLength;
      this.bottleNeckLength = _serialization.bottleNeckLength;
      this.create(this.bottleBodyLength, this.bottleNeckLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.bottleBodyLength, this.bottleNeckLength);
    }
    
  }
}