namespace FudgeCore {

  export class MeshShovel extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshShovel);

    private shovelHeadPitch: number = 0;
    private shaftLength: number = 0;
    
    public constructor(_name: string = "MeshShovel", _shovelHeadPitch: number= 0, _shaftLength: number = 0) {
      super(_name); 
      this.create(_shovelHeadPitch,_shaftLength);
      
    }
       
    public create(_shovelHeadPitch: number,_shaftLength: number): void {
        this.clear(); 
        this.vertices = new Vertices(
          new Vertex(new Vector3(-0.030934, 0.076563, 0.044907), new Vector2(0.904295, 0.000824)),
          new Vertex(new Vector3(-0.030934, 0.076563, -0.014442), new Vector2(0.949947, 0.941319)),
          new Vertex(new Vector3(0.028415, 0.076563, 0.044907), new Vector2(0.812990, 0.000016)),
          new Vertex(new Vector3(0.028415, 0.076563, -0.014442), new Vector2(0.949947, 0.000824)),
          new Vertex(new Vector3(-0.001259, 0.076563, -0.029279), new Vector2(0.904295, 0.000824)),
          new Vertex(new Vector3(-0.001259, 0.076563, 0.059745), new Vector2(0.995599, 0.941319)),
          new Vertex(new Vector3(-0.045771, 0.076563, 0.015233), new Vector2(0.858642, 0.000824)),
          new Vertex(new Vector3(0.043253, 0.076563, 0.015233), new Vector2(0.858643, 0.000016)),
          new Vertex(new Vector3(-0.030934, -1.150686 - (this.shaftLength/2), 0.044907), new Vector2(0.835816, 0.000000)),
          new Vertex(new Vector3(-0.030934, -1.150686 - (this.shaftLength/2), -0.014442), new Vector2(0.972773, 0.940304)),
          new Vertex(new Vector3(0.028415, -1.150686 - (this.shaftLength/2), 0.044907), new Vector2(0.927121, 0.000000)),
          new Vertex(new Vector3(0.028415, -1.150686 - (this.shaftLength/2), -0.014442), new Vector2(0.881469, 0.000000)),
          new Vertex(new Vector3(-0.001259, -1.150686 - (this.shaftLength/2), -0.029279), new Vector2(0.904295, 0.942378)),
          new Vertex(new Vector3(-0.001259, -1.150686 - (this.shaftLength/2), 0.059745), new Vector2(0.020416, 0.571185)),
          new Vertex(new Vector3(-0.045771, -1.150686 - (this.shaftLength/2), 0.015233), new Vector2(0.949947, 0.001011)),
          new Vertex(new Vector3(0.043253, -1.150686 - (this.shaftLength/2), 0.015233), new Vector2(0.812990, 0.944035)),
          new Vertex(new Vector3(-0.001259, -1.176415 - (this.shaftLength/2), 0.015233), new Vector2(0.000000, 0.530352)),
          new Vertex(new Vector3(0.011584 + (this.shovelHeadPitch/1.8), 0.736006, -0.036284), new Vector2(0.949947, 0.942378)),
          new Vertex(new Vector3(0.220234, 0.078110, -0.029279), new Vector2(0.904295, 0.942378)),
          new Vertex(new Vector3(0.011584 + (this.shovelHeadPitch/1.8), 0.736006, -0.023657), new Vector2(0.995600, 0.001011)),
          new Vertex(new Vector3(0.220234, 0.078110, 0.059745), new Vector2(0.061249, 0.550769)),
          new Vertex(new Vector3(-0.009801 - (this.shovelHeadPitch/1.8), 0.736006, -0.036284), new Vector2(0.040833, 0.509936)),
          new Vertex(new Vector3(-0.218450, 0.078110, -0.029279), new Vector2(0.858642, 0.942378)),
          new Vertex(new Vector3(-0.009801 - + (this.shovelHeadPitch/1.8), 0.736006, -0.023657), new Vector2(0.858643, 0.944035)),
          new Vertex(new Vector3(-0.218450, 0.078110, 0.059745), new Vector2(0.015312, 0.509936)),
          new Vertex(new Vector3(0.162918 + (this.shovelHeadPitch/2), 0.516707 , -0.014062), new Vector2(0.835816, 0.944019)),
          new Vertex(new Vector3(0.265119, 0.297409, 0.009023), new Vector2(0.045937, 0.571185)),
          new Vertex(new Vector3(0.162918  + (this.shovelHeadPitch/2), 0.516707, -0.026689), new Vector2(0.972773, 0.000000)),
          new Vertex(new Vector3(0.265119, 0.297409, -0.003604), new Vector2(0.000000, 0.555873)),
          new Vertex(new Vector3(-0.161135  - (this.shovelHeadPitch/2), 0.516707, -0.026689), new Vector2(0.927121, 0.941553)),
          new Vertex(new Vector3(-0.263335, 0.297409, -0.003604), new Vector2(0.061249, 0.525248)),
          new Vertex(new Vector3(-0.263335, 0.297409, 0.009023), new Vector2(0.881469, 0.941553)),
          new Vertex(new Vector3(-0.161135  - (this.shovelHeadPitch/2), 0.516707, -0.014062), new Vector2(0.030625, 0.540560)),
          new Vertex(new Vector3(0.000891, 0.736006, -0.026262), new Vector2(0.474970, 1.000000)),
          new Vertex(new Vector3(0.000892, 0.078110, 0.059745), new Vector2(0.617967, 0.000004)),
          new Vertex(new Vector3(0.000891, 0.736006, -0.038889), new Vector2(0.070962, 0.509936)),
          new Vertex(new Vector3(0.000892, 0.078110, -0.029279), new Vector2(0.611922, 0.843517)),
          new Vertex(new Vector3(0.000892, 0.297409, -0.025512), new Vector2(0.778464, 0.506075)),
          new Vertex(new Vector3(0.000892, 0.516707, -0.034442), new Vector2(0.474970, 0.506822)),
          new Vertex(new Vector3(0.000892, 0.297409, -0.012885), new Vector2(0.465257, 0.999894)),
          new Vertex(new Vector3(0.000892, 0.516707, -0.021815), new Vector2(0.195024, 0.000177))
        
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
          new Face(this.vertices, 21, 33, 35),
          new Face(this.vertices, 18, 34, 36),
          new Face(this.vertices, 40, 23, 32),
          new Face(this.vertices, 27, 19, 25),
          new Face(this.vertices, 38, 17, 27),
          new Face(this.vertices, 23, 29, 32),
          new Face(this.vertices, 31, 22, 24),
          new Face(this.vertices, 32, 30, 31),
          new Face(this.vertices, 37, 18, 36),
          new Face(this.vertices, 37, 27, 28),
          new Face(this.vertices, 18, 26, 20),
          new Face(this.vertices, 28, 25, 26),
          new Face(this.vertices, 39, 24, 34),
          new Face(this.vertices, 39, 32, 31),
          new Face(this.vertices, 25, 39, 26),
          new Face(this.vertices, 20, 39, 34),
          new Face(this.vertices, 29, 37, 30),
          new Face(this.vertices, 22, 37, 36),
          new Face(this.vertices, 21, 38, 29),
          new Face(this.vertices, 19, 40, 25),
          new Face(this.vertices, 36, 24, 22),
          new Face(this.vertices, 17, 33, 19),
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
          new Face(this.vertices, 21, 23, 33),
          new Face(this.vertices, 18, 20, 34),
          new Face(this.vertices, 40, 33, 23),
          new Face(this.vertices, 27, 17, 19),
          new Face(this.vertices, 38, 35, 17),
          new Face(this.vertices, 23, 21, 29),
          new Face(this.vertices, 31, 30, 22),
          new Face(this.vertices, 32, 29, 30),
          new Face(this.vertices, 37, 28, 18),
          new Face(this.vertices, 37, 38, 27),
          new Face(this.vertices, 18, 28, 26),
          new Face(this.vertices, 28, 27, 25),
          new Face(this.vertices, 39, 31, 24),
          new Face(this.vertices, 39, 40, 32),
          new Face(this.vertices, 25, 40, 39),
          new Face(this.vertices, 20, 26, 39),
          new Face(this.vertices, 29, 38, 37),
          new Face(this.vertices, 22, 30, 37),
          new Face(this.vertices, 21, 35, 38),
          new Face(this.vertices, 19, 33, 40),
          new Face(this.vertices, 36, 34, 24),
          new Face(this.vertices, 17, 35, 33)
      ];
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.shovelHeadPitch = this.shovelHeadPitch;
      serialization.shaftLength = this.shaftLength
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.shovelHeadPitch = _serialization.shovelHeadPitch;
      this.shaftLength = _serialization.shaftLength
      this.create(this.shovelHeadPitch,this.shaftLength);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.shovelHeadPitch, this.shaftLength);
    }
    
  }
}