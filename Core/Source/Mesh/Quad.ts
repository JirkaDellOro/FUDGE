namespace FudgeCore {
  export enum QUADSPLIT {
    PLANAR, AT_0, AT_1
  }

  /**
   * A surface created with four vertices which immediately creates none, one or two {@link Face}s depending on vertices at identical positions.
   * ```plaintext
   * QUADSPLIT:  PLANAR                  AT_0                     AT_1
   *             0 _ 3                   0 _ 3                    0 _ 3                         
   *              |\|                     |\|                      |/|                         
   *             1 ‾ 2                   1 ‾ 2                    1 ‾ 2                           
   *  shared last vertex 2      last vertices 2 + 3      last vertices 3 + 0 
   *      
   * ``` 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   */
  export class Quad {
    public faces: Face[];
    #split: QUADSPLIT;

    constructor(_vertices: Vertices, _index0: number, _index1: number, _index2: number, _index3: number, _split: QUADSPLIT = QUADSPLIT.PLANAR) {
      this.faces = [];
      this.#split = _split;
      try {
        if (_split != QUADSPLIT.AT_1)
          this.faces.push(new Face(_vertices, _index0, _index1, _index2));
        else
          this.faces.push(new Face(_vertices, _index1, _index2, _index3));
      } catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
      try {
        if (_split == QUADSPLIT.PLANAR)
          this.faces.push(new Face(_vertices, _index3, _index0, _index2));
        else if (_split == QUADSPLIT.AT_0)
          this.faces.push(new Face(_vertices, _index0, _index2, _index3));
        else
          this.faces.push(new Face(_vertices, _index1, _index3, _index0));
      } catch (_e: unknown) {
        Debug.fudge("Face excluded", (<Error>_e).message);
      }
    }

    public get split(): QUADSPLIT {
      return this.#split;
    }
  }
}