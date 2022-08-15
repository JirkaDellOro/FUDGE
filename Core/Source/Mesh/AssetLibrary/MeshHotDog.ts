namespace FudgeCore {

  export class MeshHotDog extends MeshMutable {
    public static readonly iSubclass: number = MeshMutable.registerSubclass(MeshHotDog);

    private hotDogLengthBun: number = 0;
    private hotDogLengthFilling: number = 0;
    private hotDogWidth: number = 0;
    private amountExtraLayers: number = 0;
    
    public constructor(_name: string = "MeshHotDog", _hotDogLengthBun: number= 0, _hotDogLengthFilling: number = 0, _hotDogWidth: number = 0, _amountExtraLayers: number = 0) {
      super(_name); 
      this.create(_hotDogLengthBun, _hotDogLengthFilling, _hotDogWidth, _amountExtraLayers);
      
    }
       
    public create(_hotDogLengthBun: number, _hotDogLengthFilling: number, _hotDogWidth: number, _amountExtraLayers: number ): void {
        this.clear(); 
        this.vertices = new Vertices(
        new Vertex(new Vector3(0.060679 + (_amountExtraLayers * 0.08) + (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), 0.033709), new Vector2(0.000000, 0.756401)),
        new Vertex(new Vector3(0.060679 + (_amountExtraLayers * 0.08) +  (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), 0.033709), new Vector2(0.391737, 0.653006)),
        new Vertex(new Vector3(0.060679 + (_amountExtraLayers * 0.08)  + (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), -0.033709), new Vector2(0.576412, 0.785739)),
        new Vertex(new Vector3(0.060679 + (_amountExtraLayers * 0.08) + (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), -0.033709), new Vector2(0.391737, 0.082152)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , -0.196488 - (_hotDogLengthBun / 2), -0.050563), new Vector2(0.545284, 0.785739)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , 0.196488 + (_hotDogLengthBun / 2), -0.050563), new Vector2(0.921646, 0.540293)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , -0.196488 - (_hotDogLengthBun / 2), 0.050563), new Vector2(0.293803, 0.653006)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , 0.196488 + (_hotDogLengthBun / 2), 0.050563), new Vector2(0.871340, 0.106730)),
        new Vertex(new Vector3(0.077533 + (_amountExtraLayers * 0.08) + (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), 0.000000), new Vector2(0.293803, 0.082152)),
        new Vertex(new Vector3(0.077533 + (_amountExtraLayers * 0.08) + (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), 0.000000), new Vector2(0.868768, 0.535195)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , 0.253042 + (_hotDogLengthBun / 2), -0.000000), new Vector2(0.576413, 0.806982)),
        new Vertex(new Vector3(0.026970 + (_amountExtraLayers * 0.08) , -0.253042 - (_hotDogLengthBun / 2), -0.000000), new Vector2(0.293803, 0.653006)),
        new Vertex(new Vector3(-0.026970, -0.157204 - (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.818463, 0.101632)),
        new Vertex(new Vector3(-0.026970, 0.157204 + (_hotDogLengthFilling / 2) , 0.026969), new Vector2(0.293803, 0.082152)),
        new Vertex(new Vector3(-0.026970, -0.157204 - (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.031129, 0.735158)),
        new Vertex(new Vector3(-0.026970, 0.157204 + (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.146901, 0.653006)),
        new Vertex(new Vector3(0.026970, -0.157204 - (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.416221, 0.653006)),
        new Vertex(new Vector3(0.026970, 0.157204 + (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.607541, 0.806982)),
        new Vertex(new Vector3(0.026970, -0.157204 - (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.416221, 0.082152)),
        new Vertex(new Vector3(0.026970, 0.157204 + (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.146901, 0.082152)),
        new Vertex(new Vector3(0.000000, -0.157204 - (_hotDogLengthFilling / 2), -0.040454), new Vector2(0.342770, 0.653006)),
        new Vertex(new Vector3(0.000000, 0.157204 + (_hotDogLengthFilling / 2), -0.040454), new Vector2(0.921646, 0.089660)),
        new Vertex(new Vector3(0.000000, -0.157204 - (_hotDogLengthFilling / 2), 0.040454), new Vector2(0.342770, 0.082152)),
        new Vertex(new Vector3(0.000000, 0.157204 + (_hotDogLengthFilling / 2), 0.040454), new Vector2(0.342770, 0.000000)),
        new Vertex(new Vector3(-0.040454, -0.157204 - (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.220352, 0.000000)),
        new Vertex(new Vector3(-0.040454, 0.157204 + (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.607541, 0.697580)),
        new Vertex(new Vector3(0.040454, -0.157204 - (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.858957, 0.000000)),
        new Vertex(new Vector3(0.040454, 0.157204 + (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.031129, 0.844561)),
        new Vertex(new Vector3(0.000000, 0.202451 + (_hotDogLengthFilling / 2), -0.000000), new Vector2(0.576413, 0.697580)),
        new Vertex(new Vector3(0.000000, -0.202451 - (_hotDogLengthFilling / 2), -0.000000), new Vector2(0.220352, 0.735158)),
        new Vertex(new Vector3(-0.060679 - (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), 0.033709), new Vector2(0.342770, 0.735158)),
        new Vertex(new Vector3(-0.060679 - (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), 0.033709), new Vector2(0.921646, 0.522450)),
        new Vertex(new Vector3(-0.060679 - (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), -0.033709), new Vector2(0.858621, 0.540293)),
        new Vertex(new Vector3(-0.060679 - (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), -0.033709), new Vector2(0.448555, 0.664876)),
        new Vertex(new Vector3(-0.026970, -0.196488 - (_hotDogLengthBun / 2), -0.050563), new Vector2(0.845765, 0.889264)),
        new Vertex(new Vector3(-0.026970, 0.196488 + (_hotDogLengthBun / 2), -0.050563), new Vector2(0.921646, 0.065728)),
        new Vertex(new Vector3(-0.026970, -0.196488 - (_hotDogLengthBun / 2) , 0.050563), new Vector2(1.000000, 0.522450)),
        new Vertex(new Vector3(-0.026970, 0.196488 + (_hotDogLengthBun / 2), 0.050563), new Vector2(0.749859, 0.889264)),
        new Vertex(new Vector3(-0.077533 - (_hotDogWidth / 2), -0.196488 - (_hotDogLengthBun / 2), 0.000000), new Vector2(0.708004, 0.926988)),
        new Vertex(new Vector3(-0.077533 - (_hotDogWidth / 2), 0.196488 + (_hotDogLengthBun / 2), 0.000000), new Vector2(0.762715, 0.540293)),
        new Vertex(new Vector3(-0.026970, 0.253042 + (_hotDogLengthBun / 2), -0.000000), new Vector2(1.000000, 0.065728)),
        new Vertex(new Vector3(-0.026970, -0.253042 - (_hotDogLengthBun / 2), -0.000000), new Vector2(0.416744, 0.722607))
        
      );
        for (let i: number = 0;  i < _amountExtraLayers; i++) {
        this.vertices.push(new Vertex(new Vector3(-0.026970 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.921646, 0.522450)), new Vertex(new Vector3(-0.026970 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.858621, 0.540293)), new Vertex(new Vector3(-0.026970 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.448555, 0.664876)), new Vertex(new Vector3(-0.026970 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.845765, 0.889264)), new Vertex(new Vector3(0.026970 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), 0.026969), new Vector2(0.921646, 0.065728)), new Vertex(new Vector3(0.026970 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), 0.026969), new Vector2(1.000000, 0.522450)), new Vertex(new Vector3(0.026970 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.749859, 0.889264)), new Vertex(new Vector3(0.026970 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), -0.026970), new Vector2(0.708004, 0.926988)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), -0.040454), new Vector2(0.762715, 0.540293)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), -0.040454), new Vector2(1.000000, 0.065728)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), 0.040454), new Vector2(0.416744, 0.722607)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), 0.040454), new Vector2(0.592509, 0.522450)), new Vertex(new Vector3(-0.040454 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.899818, 0.926988)), new Vertex(new Vector3(-0.040454 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.592509, 0.065728)), new Vertex(new Vector3(0.040454 + (0.08 * (i + 1)) , -0.157204 - (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.803911, 0.926988)), new Vertex(new Vector3(0.040454 + (0.08 * (i + 1)) , 0.157204 + (_hotDogLengthFilling / 2), 0.000000), new Vector2(0.666808, 0.540293)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , 0.202451 + (_hotDogLengthFilling / 2), -0.000000), new Vector2(0.514155, 0.522450)), new Vertex(new Vector3(0.000000 + (0.08 * (i + 1)) , -0.202451 - (_hotDogLengthFilling / 2), -0.000000), new Vector2(0.653952, 0.889264)));
      //  console.log(this.vertices);
      }
        this.faces = [
        new Face(this.vertices, 5, 2, 4),
        new Face(this.vertices, 9, 0, 8),
        new Face(this.vertices, 11, 0, 6),
        new Face(this.vertices, 10, 1, 9),
        new Face(this.vertices, 1, 6, 0),
        new Face(this.vertices, 3, 10, 9),
        new Face(this.vertices, 2, 11, 4),
        new Face(this.vertices, 3, 8, 2),
        new Face(this.vertices, 10, 5, 7),
        new Face(this.vertices, 7, 4, 6),
        new Face(this.vertices, 11, 6, 4),
        new Face(this.vertices, 25, 14, 24),
        new Face(this.vertices, 21, 18, 20),
        new Face(this.vertices, 27, 16, 26),
        new Face(this.vertices, 23, 12, 22),
        new Face(this.vertices, 29, 16, 22),
        new Face(this.vertices, 28, 13, 23),
        new Face(this.vertices, 28, 17, 27),
        new Face(this.vertices, 29, 12, 24),
        new Face(this.vertices, 17, 22, 16),
        new Face(this.vertices, 15, 20, 14),
        new Face(this.vertices, 14, 29, 24),
        new Face(this.vertices, 19, 28, 27),
        new Face(this.vertices, 15, 28, 21),
        new Face(this.vertices, 18, 29, 20),
        new Face(this.vertices, 19, 26, 18),
        new Face(this.vertices, 13, 24, 12),
        new Face(this.vertices, 39, 32, 38),
        new Face(this.vertices, 37, 30, 36),
        new Face(this.vertices, 40, 31, 37),
        new Face(this.vertices, 41, 30, 38),
        new Face(this.vertices, 33, 34, 32),
        new Face(this.vertices, 32, 41, 38),
        new Face(this.vertices, 33, 40, 35),
        new Face(this.vertices, 31, 38, 30),
        new Face(this.vertices, 40, 37, 35),
        new Face(this.vertices, 34, 37, 36),
        new Face(this.vertices, 41, 34, 36),
        new Face(this.vertices, 5, 3, 2),
        new Face(this.vertices, 9, 1, 0),
        new Face(this.vertices, 11, 8, 0),
        new Face(this.vertices, 10, 7, 1),
        new Face(this.vertices, 1, 7, 6),
        new Face(this.vertices, 3, 5, 10),
        new Face(this.vertices, 2, 8, 11),
        new Face(this.vertices, 3, 9, 8),
        new Face(this.vertices, 7, 5, 4),
        new Face(this.vertices, 25, 15, 14),
        new Face(this.vertices, 21, 19, 18),
        new Face(this.vertices, 27, 17, 16),
        new Face(this.vertices, 23, 13, 12),
        new Face(this.vertices, 29, 26, 16),
        new Face(this.vertices, 28, 25, 13),
        new Face(this.vertices, 28, 23, 17),
        new Face(this.vertices, 29, 22, 12),
        new Face(this.vertices, 17, 23, 22),
        new Face(this.vertices, 15, 21, 20),
        new Face(this.vertices, 14, 20, 29),
        new Face(this.vertices, 19, 21, 28),
        new Face(this.vertices, 15, 25, 28),
        new Face(this.vertices, 18, 26, 29),
        new Face(this.vertices, 19, 27, 26),
        new Face(this.vertices, 13, 25, 24),
        new Face(this.vertices, 39, 33, 32),
        new Face(this.vertices, 37, 31, 30),
        new Face(this.vertices, 40, 39, 31),
        new Face(this.vertices, 41, 36, 30),
        new Face(this.vertices, 33, 35, 34),
        new Face(this.vertices, 32, 34, 41),
        new Face(this.vertices, 33, 39, 40),
        new Face(this.vertices, 31, 39, 38),
        new Face(this.vertices, 34, 35, 37)
      ];
        for (let i: number = 0;  i < _amountExtraLayers; i++) {
            this.faces.push(new Face(this.vertices, 55 + (i * 18) , 44 + (i * 18) , 54 + (i * 18) ), new Face(this.vertices, 51 + (i * 18) , 48 + (i * 18) , 50 + (i * 18) ), new Face(this.vertices, 57 + (i * 18) , 46 + (i * 18) , 56 + (i * 18) ), new Face(this.vertices, 53 + (i * 18) , 42 + (i * 18) , 52 + (i * 18) ), new Face(this.vertices, 59 + (i * 18) , 46 + (i * 18) , 52 + (i * 18) ), new Face(this.vertices, 58 + (i * 18) , 43 + (i * 18) , 53 + (i * 18) ), new Face(this.vertices, 58 + (i * 18) , 47 + (i * 18) , 57 + (i * 18) ), new Face(this.vertices, 59 + (i * 18) , 42 + (i * 18) , 54 + (i * 18) ), new Face(this.vertices, 47 + (i * 18) , 52 + (i * 18) , 46 + (i * 18) ), new Face(this.vertices, 45 + (i * 18) , 50 + (i * 18) , 44 + (i * 18) ), new Face(this.vertices, 44 + (i * 18) , 59 + (i * 18) , 54 + (i * 18) ), new Face(this.vertices, 49 + (i * 18) , 58 + (i * 18) , 57 + (i * 18) ), new Face(this.vertices, 45 + (i * 18) , 58 + (i * 18) , 51 + (i * 18) ), new Face(this.vertices, 48 + (i * 18) , 59 + (i * 18) , 50 + (i * 18) ), new Face(this.vertices, 49 + (i * 18) , 56 + (i * 18) , 48 + (i * 18) ), new Face(this.vertices, 43 + (i * 18) , 54 + (i * 18) , 42 + (i * 18) ), new Face(this.vertices, 55 + (i * 18) , 45 + (i * 18) , 44 + (i * 18) ), new Face(this.vertices, 51 + (i * 18) , 49 + (i * 18) , 48 + (i * 18) ), new Face(this.vertices, 57 + (i * 18) , 47 + (i * 18) , 46 + (i * 18) ), new Face(this.vertices, 53 + (i * 18) , 43 + (i * 18) , 42 + (i * 18) ), new Face(this.vertices, 59 + (i * 18) , 56 + (i * 18) , 46 + (i * 18) ), new Face(this.vertices, 58 + (i * 18) , 55 + (i * 18) , 43 + (i * 18) ), new Face(this.vertices, 58 + (i * 18) , 53 + (i * 18) , 47 + (i * 18) ), new Face(this.vertices, 59 + (i * 18) , 52 + (i * 18) , 42 + (i * 18) ), new Face(this.vertices, 47 + (i * 18) , 53 + (i * 18) , 52 + (i * 18) ), new Face(this.vertices, 45 + (i * 18) , 51 + (i * 18) , 50 + (i * 18) ), new Face(this.vertices, 44 + (i * 18) , 50 + (i * 18) , 59 + (i * 18) ), new Face(this.vertices, 49 + (i * 18) , 51 + (i * 18) , 58 + (i * 18) ), new Face(this.vertices, 45 + (i * 18) , 55 + (i * 18) , 58 + (i * 18) ), new Face(this.vertices, 48 + (i * 18) , 56 + (i * 18) , 59 + (i * 18) ), new Face(this.vertices, 49 + (i * 18) , 57 + (i * 18) , 56 + (i * 18) ), new Face(this.vertices, 43 + (i * 18) , 55 + (i * 18) , 54 + (i * 18) )); 
        //    console.log(this.faces);       
        }
      }
    
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.hotDogLengthBun = this.hotDogLengthBun;
      serialization.hotDogLengthFilling = this.hotDogLengthFilling;
      serialization.hotDogWidth = this.hotDogWidth;
      serialization.amountExtraLayers = this.amountExtraLayers;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.hotDogLengthBun = _serialization.hotDogLengthBun;
      this.hotDogLengthFilling = _serialization.hotDogLengthFilling;
      this.hotDogWidth = _serialization.hotDogWidth;
      this.amountExtraLayers = _serialization.amountExtraLayers;
      this.create(this.hotDogLengthBun, this.hotDogLengthFilling, this.hotDogWidth, this.amountExtraLayers);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(this.hotDogLengthBun, this.hotDogWidth, this.hotDogLengthFilling, this.amountExtraLayers);
    }
    
  }
}