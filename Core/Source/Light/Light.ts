namespace FudgeCore {
  export type TypeOfLight = new () => Light;
  /**
   * Baseclass for different kinds of lights. 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export abstract class Light extends Mutable implements Serializable {
    public color: Color;
    constructor(_color: Color = new Color(1, 1, 1, 1)) {
      super();
      this.color = _color;
    }

    public getType(): TypeOfLight {
      return <TypeOfLight>this.constructor;
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        color: this.color.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.color.deserialize(_serialization.color);
      return this;
    }

    protected reduceMutator(): void {/**/ }
  }

  /**
   * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)  
   * ```plaintext
   * ~ ~ ~  
   *  ~ ~ ~  
   * ```
   */
  export class LightAmbient extends Light {
    constructor(_color: Color = new Color(1, 1, 1, 1)) {
      super(_color);
    }
  }
  /**
   * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)  
   * ```plaintext
   * --->  
   * --->  
   * --->  
   * ```
   */
  export class LightDirectional extends Light {
    constructor(_color: Color = new Color(1, 1, 1, 1)) {
      super(_color);
    }
  }
  /**
   * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)  
   * ```plaintext
   *         .\|/.
   *        -- o --
   *         ´/|\`
   * ```
   */
  export class LightPoint extends Light {
    public range: number = 10;
  }
  /**
   * Spot light emitting within a specified angle from its position, illuminating objects depending on their position and distance with its color  
   * ```plaintext
   *          o  
   *         /|\  
   *        / | \ 
   * ```   
   */
  export class LightSpot extends Light {
  }
}