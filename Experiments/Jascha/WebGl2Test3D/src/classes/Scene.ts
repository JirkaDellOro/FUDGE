namespace WebGl2Test3D {

    export class Scene {

        private sceneObjects: FudgeNode[];
        private name: string;

        public constructor(_name: string) {
            this.setName(_name);
            this.sceneObjects = [];
        }

        public getName(): string {
            return this.name;
        }

        public setName(_name: string): void {
            this.name = _name;
        }

        public addSceneObject(_sceneObject: FudgeNode): void {
            this.sceneObjects.push(_sceneObject);
        }

        public removeSceneObject(_name: string){
            let sceneObject: FudgeNode;
            for (let i: number = 0; i < this.sceneObjects.length; i++) {
                if (this.sceneObjects[i].getName() == _name) {
                    sceneObject = this.sceneObjects[i];
                    console.log(sceneObject);
                    return sceneObject;
                }
            }
            if (sceneObject == undefined) {
                throw new Error(`Unable to find sceneobject named  '${_name}'in FudgeNode named '${this.getName()}'`);
            }
        }

        public draw(): void{
            gl2.viewport(0, 0, gl2.canvas.width, gl2.canvas.height);
            gl2.clearColor(0, 0, 0, 0);
            gl2.clear(gl2.COLOR_BUFFER_BIT);           
        }
    }
}