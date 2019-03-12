namespace Fudge {
    /**
     * Class to hold the transformationdata of the node it is attached to. Extends Pivot for fewer redundancies.
     * While Pivot only affects the mesh of the node it is attached to, without altering the nodes origin, the 
     * Transform component affects the origin of a node and its descendants.
     */
    export class TransformComponent extends PivotComponent {
        /* */private worldMatrix: Mat4 ;
        //* TODO: figure out why there is an extra matrix necessary. Implement initialize method if applicable
        public constructor() {
            super();
            this.worldMatrix = this.matrix;
        }
        //*/
        // Get and Set methods.######################################################################################
        public get WorldMatrix(): Mat4 {
            /* */return this.worldMatrix;
            //* */return this.matrix;
        }
        public set WorldMatrix(_matrix: Mat4) {
            /* */this.worldMatrix = _matrix;
            //* */this.matrix = _matrix;
        }
        public get WorldPosition(): Vec3 {
            /* */return new Vec3(this.worldMatrix.Data[12], this.worldMatrix.Data[13], this.worldMatrix.Data[14]);
            //* */return new Vec3(this.matrix.Data[12], this.matrix.Data[13], this.matrix.Data[14]);
        }
    } 
}
