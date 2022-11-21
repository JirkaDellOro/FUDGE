namespace FudgeCore {
  enum Name {
    objects = "Objects",
    name = "Name",
    version = "Version",
    geometryVersion = "GeometryVersion",
    properties70 = "Properties70",
    vertices = "Vertices",
    indices = "PolygonVertexIndex",
    normals = "Normals",
    uvs = "UV",
    uvIndices = "UVIndex",
    materials = "Materials",
    mapping = "MappingInformationType",
    referencing = "ReferenceInformationType",
    layerNormal = "LayerElementNormal",
    layerUV = "LayerElementUV",
    layerMaterial = "LayerElementMaterial",
    shadingModel = "ShadingModel",
    multiLayer = "MultiLayer",
    emissive = "Emissive",
    ambient = "Ambient",
    diffuse = "Diffuse",
    specular = "Specular",
    shininess = "Shininess",
    opacity = "Opacity",
    reflectivity = "Reflectivity"
  }

  enum Index {
    objects = 8
  }

  enum IndexMesh {
    vertices, indices, edges, version,
    layerNormal, layerUV, layerMaterial, layer
  }

  enum IndexMaterial {
    vertices, indices, edges, version,
    shadingModel, multiLayer, emissive, ambient, diffuse, specular, shininess, opacity, reflectivity
  }

  enum IndexLayerElement {
    version, name, mapping, referencing
  }

  export class FBXLoader {

    private static loaders: { [uri: string]: FBXLoader };

    public readonly nodes: FBX.Node[];
    public readonly uri: string;

    #documents: FBX.Document[];
    #definitions: FBX.Definitions;
    #objects: FBX.Object[];
    #connections: FBX.Connection[];

    public constructor(_buffer: ArrayBuffer, _uri: string) {
      this.nodes = FBX.parseNodesFromBinary(_buffer);
    }
    
    public static async LOAD(_uri: string): Promise<FBXLoader> {
      if (!this.loaders)
        this.loaders = {};
      if (!this.loaders[_uri]) {      
        const response: Response = await fetch(_uri);
        const binary: ArrayBuffer = await response.arrayBuffer();
        this.loaders[_uri] = new FBXLoader(binary, _uri);
      }
      return this.loaders[_uri];
    }

    public getObjects(): FBX.Object[] {
      if (!this.#objects) {
        const objects: FBX.Node = this.getNode(this.nodes, Name.objects, Index.objects);
        this.#objects = objects.children.map(_object => this.getObject(_object));
      }
      return this.#objects;
    }

    private getObject(_node: FBX.Node): FBX.Object {
      const nameAndType: string[] = (_node.properties[1] as string).split("::");
      const object: FBX.Object = {
        uid: _node.properties[0] as number,
        name: nameAndType[0],
        type: nameAndType[1],
        subtype: _node.properties[2] as string
      };

      return {
        Geometry: () => ({
          uid: object.uid,
          name: object.name,
          type: object.type,
          subtype: object.subtype,
          version: this.getNodePropertyValue(_node, Name.geometryVersion, IndexMesh.version),
          vertices: this.getNodePropertyValue(_node, Name.vertices, IndexMesh.vertices),
          indices: this.getNodePropertyValue(_node, Name.indices, IndexMesh.indices),
          layerElementNormal: this.getLayerElement(this.getNode(_node.children, Name.layerNormal, IndexMesh.layerNormal)),
          layerElementUV: this.getLayerElement(this.getNode(_node.children, Name.layerUV, IndexMesh.layerUV)),
          layerElementMaterial: this.getLayerElement(this.getNode(_node.children, Name.layerMaterial, IndexMesh.layerMaterial))
        } as FBX.Mesh),
        Material: () => ({
          uid: object.uid,
          name: object.name,
          type: object.type,
          subtype: object.subtype,
          version: this.getNodePropertyValue(_node, Name.version, IndexMaterial.version),
          shadingModel: this.getNodePropertyValue(_node, Name.shadingModel, IndexMaterial.shadingModel),
          multiLayer: this.getNodePropertyValue(_node, Name.multiLayer, IndexMaterial.multiLayer),
          emissive: this.getProperty70Value(_node, Name.emissive),
          ambient: this.getProperty70Value(_node, Name.ambient),
          diffuse: this.getProperty70Value(_node, Name.diffuse),
          specular: this.getProperty70Value(_node, Name.specular),
          shininess: this.getProperty70Value(_node, Name.shininess),
          opacity: this.getProperty70Value(_node, Name.opacity),
          reflectivity: this.getProperty70Value(_node, Name.reflectivity)
        } as FBX.Material)
      }[object.type]?.call(this) || object;
    }

    private getLayerElement<T extends FBX.LayerElement>(_node: FBX.Node): T {
      // enum index can be retrieved by string, but ts doesn't know
      // ref: https://www.angularjswiki.com/angular/how-to-convert-a-string-to-enum-in-typescript-or-angular/
      const layerElement: FBX.LayerElement = {
        name: this.getNode(_node.children, Name.name, IndexLayerElement.name).properties[0] as string,
        version: this.getNode(_node.children, Name.version, IndexLayerElement.version).properties[0] as number,
        mapping: this.getNode(_node.children, Name.mapping, IndexLayerElement.mapping).properties[0] as string,
        referencing: this.getNode(_node.children, Name.referencing, IndexLayerElement.referencing).properties[0] as string
      };

      return {
        layerNormal: () => ({
          name: layerElement.name,
          version: layerElement.version,
          mapping: layerElement.mapping,
          referencing: layerElement.referencing,
          normals: this.getNode(_node.children, Name.normals, 4).properties[0] as Float32Array
        }),
        layerUV: () => ({
          name: layerElement.name,
          version: layerElement.version,
          mapping: layerElement.mapping,
          referencing: layerElement.referencing,
          uvs: this.getNode(_node.children, Name.uvs, 4).properties[0] as Float32Array,
          uvIndices: this.getNode(_node.children, Name.uvIndices, 5).properties[0] as Uint16Array
        }),
        layerMaterial: () => ({
          name: layerElement.name,
          version: layerElement.version,
          mapping: layerElement.mapping,
          referencing: layerElement.referencing,
          materials: this.getNode(_node.children, Name.materials, 4).properties[0] as number
        })
      }[_node.name]?.call(this);
    }

    private getNodePropertyValue<T extends FBX.NodeProperty>(_node: FBX.Node, _name: string, _index: number): T {
      return this.getNode(_node.children, _name, _index).properties[0] as T;
    }

    private getProperty70Value<T extends boolean | number | string | Vector3>(_node: FBX.Node, _name: string): T {
      const property: FBX.Node = _node.children
        .find(_child => _child.name == Name.properties70).children
        .find(_property => _property.properties[0] == _name);
      return property.properties[1] as string == "Vector3D"
        ? new Vector3(...property.properties.slice(4, 6) as number[]) as T
        : property.properties[4] as T;
    }

    private getNode(_array: FBX.Node[], _name: string, _index: number): FBX.Node {
      return _array[_index]?.name == _name
        ? _array[_index]
        : _array.find(node => node.name == _name);
    }

  }
}