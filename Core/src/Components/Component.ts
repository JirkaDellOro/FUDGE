namespace Fudge {
    /** 
     * Superclass for all Components that may be attached to Nodes.
     */
    export abstract class Component {
        protected container: Node | null = null;
        protected singleton: boolean = false;

        public get className(): string {
            return this.constructor.name;
        }
        public get isSingleton(): boolean {
            return this.singleton;
        }
        public get Container(): Node | null {
            return this.container;
        }
        public set Container(_container: Node | null) {
            this.container = _container;
        }
    }
}