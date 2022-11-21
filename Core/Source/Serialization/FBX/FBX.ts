namespace FudgeCore.FBX {

  export interface Document {
    uid: number;
    name: string;
    sourceObject: Object;
    activeAnimStackName: string;
    rootNode: number;
  }

  export interface Definitions {
    version: number;
    objectTypes: ObjectType[];
  }

  export interface ObjectType {
    name: string;
    count: number;
    propertyTemplate: PropertyTemplate;
  }

  export interface PropertyTemplate {
    name: string;
    [propertyName: string]: Property;
  }

  export interface Object {
    uid: number;
    name: string;
    type: string;
    subtype: string;
  }

  export interface Mesh extends Object {
    version: number;
    vertices: Float32Array;
    indices: Uint16Array;
    edges?: Uint16Array;
    layerElementNormal: LayerElementNormal;
    layerElementUV: LayerElementUV;
    layerElementMaterial: LayerElementMaterial;
  }

  export interface Material extends Object {
    version: number;
    shadingModel: string;
    multiLayer: boolean;
    emissive: Vector3;
    ambient: Vector3;
    diffuse: Vector3;
    specular: Vector3;
    shininess: number;
    opacity: number;
    reflectivity: number;
  }

  export interface LayerElement {
    name: string;
    version: number;
    mapping: string;
    referencing: string;
  }

  export interface LayerElementNormal extends LayerElement {
    normals: Float32Array;
  }

  export interface LayerElementUV extends LayerElement {
    uvs?: Float32Array;
    uvIndices?: Uint16Array;
  }

  export interface LayerElementMaterial extends LayerElement {
    materials?: number;
  }

  export enum MappingInformationType {
    ByVertex, ByPolygon, ByPolygonVertex, ByEdge, AllSame
  }

  export enum ReferenceInformationType {
    Direct, IndexToDirect
  }

  export interface Connection {
    parentUID: number;
    childUID: number;
    propertyName: string;
  }

  export type Property = boolean | number | string | Vector3;

  export interface Node {
    name: string;
    properties: NodeProperty[];
    children: Node[];
  }

  export type NodeProperty = boolean | number | string | Uint8Array | Uint16Array | Float32Array;

  export const binaryStartChars: Uint8Array
    = Uint8Array.from("Kaydara FBX Binary\x20\x20\x00\x1a\x00".split(""), (v) => v.charCodeAt(0));

  export enum ArrayEncoding {
    UNCOMPRESSED, COMPRESSED
  }

}