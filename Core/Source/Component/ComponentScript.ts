namespace FudgeCore {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentScript extends Component {
        constructor() {
            super();
            this.singleton = false;
        }

        public serialize(): Serialization {
            return this.getMutator();
        }

        public deserialize(_serialization: Serialization): Serializable {
            this.mutate(_serialization);
            return this;
        }
    }
}