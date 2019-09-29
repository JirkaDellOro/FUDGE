namespace FudgeUserInterface {
    /**
     * <select><option>Hallo</option></select>
     */
    import ƒ = FudgeCore;

    export enum NODEMENU {
        EMPTY = "Primitive.Empty Node",
        BOX = "Primitive.Box Mesh Node",
        PYRAMID = "Primitive.Pyramid Mesh Node",
        PLANE = "Primitive.Plane Mesh Node"
    }

    export class MultiLevelMenuManager {

        public static buildFromSignature(_signature: string, _mutator?: ƒ.Mutator): ƒ.Mutator {
            let mutator: ƒ.Mutator = _mutator || {};
            let signatureLevels: string[] = _signature.split(".");
            if (signatureLevels.length > 1) {
                let subSignature: string = signatureLevels[1];
                for (let i: number = 2; i < signatureLevels.length; i++) {
                    subSignature = subSignature + "." + signatureLevels[i];

                }
                if (mutator[signatureLevels[0]] != null) {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature, <ƒ.Mutator>mutator[signatureLevels[0]]);
                }
                else {
                    mutator[signatureLevels[0]] = this.buildFromSignature(subSignature);
                }
            }
            else {
                mutator[signatureLevels[0]] = signatureLevels[0];
            }
            return mutator;
        }
    }
}