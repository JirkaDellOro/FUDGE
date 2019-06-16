namespace Fudge {
    /**
     * Baseclass for different kinds of lights. 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Light extends Mutable {
        public color: Color = new Color(0.1, 0.1, 0.1, 1);
        protected reduceMutator(): void {/**/ }
    }

    /**
     * Ambient light, coming from all directions, illuminating everything with its color independent of position and orientation (like a foggy day or in the shades)  
     * ```text
     * ~ ~ ~  
     *  ~ ~ ~  
     * ```
     */
    export class LightAmbient extends Light {
    }
    /**
     * Directional light, illuminating everything from a specified direction with its color (like standing in bright sunlight)  
     * ```text
     * --->  
     * --->  
     * --->  
     * ```
     */
    export class LightDirectional extends Light {
        public direction: Vector3 = new Vector3(1, -1, -1);
    }
    /**
     * Omnidirectional light emitting from its position, illuminating objects depending on their position and distance with its color (like a colored light bulb)  
     * ```text
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
     * ```text
     *          o  
     *         /|\  
     *        / | \ 
     * ```   
     */
    export class LightSpot extends Light {
    }
}