namespace FBX {
  /**
   * Interface to represent fbx files containing its documents, definitions, objects and connections.
   * Its objects are devided in all and the different object types.
   * @author Matthias Roming, HFU, 2023
   */
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
    parents?: Object[];

    loaded: boolean;
    load: () => Object;
  }

  /**
   * Interface to represent fbx-objects.
   * All fields other than uid, name, type, subtype, children and parents are loaded with the load-method.
   * Each object can be interpreted as an explicit fbx object type defined in FudgeCore.FBX. Explicit types have been defined
   * with the help of following reference:
   * https://archive.blender.org/wiki/index.php/User:Mont29/Foundation/FBX_File_Structure/#Some_Specific_Property_Types
   * @author Matthias Roming, HFU, 2023
   * @ignore
   */
  export interface Object extends ObjectBase {
    [name: string]: NodeProperty | { [name: string]: NodeProperty } | Property70 | Object | Object[] | (() => Object);
  }

  export interface Document extends ObjectBase {
    SourceObject?: undefined;
    ActiveAnimStackName?: string;
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
    LayerElementUV?: LayerElementUV; // | LayerElementUV[]; // TODO: might need to readd this
    LayerElementMaterial?: LayerElementMaterial;
  }

  export interface Model extends ObjectBase {
    Version?: number;
    LclTranslation?: FudgeCore.Vector3 | AnimCurveNode;
    LclRotation?: FudgeCore.Vector3 | AnimCurveNode;
    LclScaling?: FudgeCore.Vector3 | AnimCurveNode;
    PreRotation?: FudgeCore.Vector3;
    PostRotation?: FudgeCore.Vector3;
    ScalingOffset?: FudgeCore.Vector3;
    ScalingPivot?: FudgeCore.Vector3;
    RotationOffset?: FudgeCore.Vector3;
    RotationPivot?: FudgeCore.Vector3;
    InheritType?: number;
    EulerOrder?: string;
    currentUVSet?: string;
  }

  export interface Material extends ObjectBase {
    Version?: number;
    ShadingModel?: string;

    Diffuse?: FudgeCore.Vector3;
    DiffuseColor?: FudgeCore.Vector3 | Texture;
    DiffuseFactor?: number;

    Ambient?: FudgeCore.Vector3;
    AmbientColor?: FudgeCore.Vector3 | Texture;

    Shininess?: number;
    ShininessExponent?: FudgeCore.Vector3 | Texture;

    Specular?: FudgeCore.Vector3;
    SpecularColor?: FudgeCore.Vector3 | Texture;
    SpecularFactor?: number;

    Reflectivity?: number;
    ReflectionFactor?: number;

    Opacity?: number;
    TransparencyFactor?: number;

    Emissive?: FudgeCore.Vector3;
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
    UseMipMap?: number;
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
    KeyTime?: BigInt64Array;
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
    NormalsIndex?: Uint16Array; // TODO: find an FBX file which uses normals index
  }

  export interface LayerElementUV extends LayerElement {
    UV?: Float32Array;
    UVIndex?: Uint16Array;
  }

  export interface LayerElementMaterial extends LayerElement {
    Materials?: number;
  }

  export enum MAPPING_INFORMATION_TYPE {
    BY_VERTEX, BY_POLYGON, BY_POLYGON_VERTEX, BY_EDGE, ALL_SAME
  }

  export enum REFERENCE_INFORMATION_TYPE {
    DIRECT, INDEX_TO_DIRECT
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
    [propertyName: string]: Property70;
    name: string;
  }
}