namespace FudgeCore.FBX {

  export interface FBX {
    documents: Document[];
    definitions?: Definitions;
    objects: {
      all: Object[];
      models: Model[];
      geometries: Geometry[];
      poses: Object[];
      materials: Material[];
      textures: Texture[];
      animStacks: Object[];
    };
    connections: Connection[];
  }

  interface ObjectBase {
    uid: number;
    name: string;
    type?: string;
    subtype?: string;
    children?: Object[];
    parent?: Object;

    loaded: boolean;
    load: () => Object;
  }

  export interface Object extends ObjectBase {
    [name: string]: NodeProperty | { [name: string]: NodeProperty } | Property70 | Object | Object[] | (() => Object);
  }

  export interface Document extends ObjectBase {
    SourceObject?: undefined;
    ActiveAnimation?: string;
    RootNode?: number;
  }

  export interface NodeAttribute extends ObjectBase {
    TypeFlags?: string;
  }

  export interface Geometry extends ObjectBase {
    GeometryVersion?: number; 
    Vertices?: Float32Array;
    PolygonVertexIndex?: Int32Array;
    LayerElementNormal?: LayerElementNormal;
    LayerElementUV?: LayerElementUV | LayerElementUV[];
    LayerElementMaterial?: LayerElementMaterial;
  }

  export interface Model extends ObjectBase {
    Version?: number;
    LclTranslation?: number | Vector3 | AnimCurveNode;
    LclRotation?: number | Vector3 | AnimCurveNode;
    LclScaling?: number | Vector3 | AnimCurveNode;
    PreRotation?: Vector3;
    currentUVSet?: string;
  }

  export interface Material extends ObjectBase {
    Version?: number;
    ShadingModel?: string;

    Diffuse?: Vector3;
    DiffuseColor?: Texture;
    DiffuseFactor?: number;

    Ambient?: Vector3;
    AmbientColor?: Vector3 | Texture;

    Shininess?: number;
    ShininessExponent?: Vector3 | Texture;

    Specular?: Vector3;
    SpecularColor?: Vector3 | Texture;

    Reflectivity?: number;
    ReflectionFactor?: number;

    Opacity?: number;
    TransparencyFactor?: number;
    
    Emissive?: Vector3;
    NormalMap?: Texture;
  }

  export interface Deformer extends ObjectBase {
    Version?: number;
    SkinningType?: string;
  }

  export interface SubDeformer extends ObjectBase {
    Version?: number;
    Transform?: Float32Array;
    TransformLink?: Float32Array;
    Indexes?: Uint16Array;
    Weights?: Float32Array;
  }

  export interface Texture extends ObjectBase {
    FileName?: string;
    RelativeFilename?: string;
    ModelUVScaling?: number;
    ModelUVTranslation?: number;
    UVSet?: string;
  }

  export interface Video extends ObjectBase {
    FileName?: string;
    RelativeFilename?: string;
    UseMipMap?:  number;
    Content?: Uint8Array;
  }

  export interface AnimCurveNode extends ObjectBase {
    dX?: number | AnimCurve;
    dY?: number | AnimCurve;
    dZ?: number | AnimCurve;
  }

  export interface AnimCurve extends ObjectBase {
    KeyVer?: number;
    Default?: number;
    KeyTime?: Uint16Array;
    KeyValueFloat?: Float32Array;
  }

  export interface LayerElement {
    Name: string;
    Version: number;
    MappingInformationType: string;
    ReferenceInformationType: string;
  }

  export interface LayerElementNormal extends LayerElement {
    Normals: Float32Array;
    NormalsW: Float32Array;
  }

  export interface LayerElementUV extends LayerElement {
    UV?: Float32Array;
    UVIndex?: Uint16Array;
  }

  export interface LayerElementMaterial extends LayerElement {
    Materials?: number;
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
    [propertyName: string]: Property70;
  }

}