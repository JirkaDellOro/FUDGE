import { Scene, Vector3 } from 'babylonjs';

export interface BuildMeshMessage {
    count: number;
    type: string;
    scene: Scene;
    isBuilt: boolean;
}

export interface AnimKey {
    frame: number;
    value: Vector3;
}

