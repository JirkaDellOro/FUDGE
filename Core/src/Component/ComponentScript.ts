namespace Fudge {
    /**
     * Base class for scripts the user writes
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class ComponentScript extends Component {
        constructor() {
            super();
            this.singleton = false;
        }
    }
}