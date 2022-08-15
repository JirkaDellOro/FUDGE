namespace FudgeCore {
    export abstract class MeshMutable extends Mesh {
        public static readonly subclasses: typeof MeshMutable[] = [];  
 
        protected static registerSubclass(_subClass: typeof MeshMutable): number { return MeshMutable.subclasses.push(_subClass) - 1; }
    }
}