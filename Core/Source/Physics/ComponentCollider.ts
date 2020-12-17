namespace FudgeCore {

    /** Base Class for different collider types */
    export class ComponentCollider extends Component {
        public static readonly iSubclass: number = Component.registerSubclass(ComponentCollider);

        /** The pivot of the physics itself. Default the pivot is identical to the transform. It's used like an offset. */
        public pivot: Matrix4x4 = Matrix4x4.IDENTITY();

        public colType: COLLIDER_TYPE;

        constructor(_colliderType: COLLIDER_TYPE = COLLIDER_TYPE.CUBE) {
            super();
            this.colType = _colliderType;
        }

        //TODO - Implement completly seperate collider
        //TODO - LOW PRIORITY - Look if it's possible to give a value through complete collision detection that determines whever a collision response is triggered (accurate triggers)
        //The collider must add themselves as shape to a existing rigidbody on their creation
        //what if there is no rb present? create rb, instantly remove the collider component again?, just act as a dataclass and have a dirty status?
        //When the component is removed it must remove itself from the rb -> rb must always know it's colliders
        //Must receive things like friction, restituion from rb, on every change

        //Events
        //each collider is registering events, but event management should stay on the rb?
        //Collision Event -> 

        //Subclass
        //must implement creation for the specific collider
        //each collider has it's own pivot that must be updated with the rb -> does the collider inherit scale? probably
    }
}