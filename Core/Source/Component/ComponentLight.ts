namespace FudgeCore {
    /**
     * Attaches a [[Light]] to the node
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentLight extends Component {
        private light: Light;

        constructor(_light: Light = null) {
            super();
            this.singleton = false;
            this.light = _light;
        }

        public getLight(): Light {
            return this.light;
        }
    }
}