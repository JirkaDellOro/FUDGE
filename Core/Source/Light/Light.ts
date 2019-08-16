namespace FudgeCore {
    /**
     * Baseclass for different kinds of lights. 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Light extends Mutable {
        public color: Color;
        constructor(_color: Color = new Color(1, 1, 1, 1)) {
            super();
            this.color = _color;
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
        public direction: Vector3 = new Vector3(0, -1, 0);
        constructor(_color: Color = new Color(1, 1, 1, 1), _direction: Vector3 = new Vector3(0, -1, 0)) {
            super(_color);
            this.direction = _direction;
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