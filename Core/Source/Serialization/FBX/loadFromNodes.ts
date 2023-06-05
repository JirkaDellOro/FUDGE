namespace FudgeCore.FBX {
  /**
   * Loads an fbx file from its fbx-node array which may be retrieved by parseNodesFromBinary.
   * @author Matthias Roming, HFU, 2023
   */
  export function loadFromNodes(_nodes: Node[]): FBX {
    const fbx: FBX = {
      documents: undefined,
      objects: {
        all: undefined,
        models: [],
        geometries: [],
        materials: [],
        poses: [],
        textures: [],
        animStacks: []
      },
      connections: undefined
    };

    for (const node of _nodes) {
      if (node.name == "Documents")
        fbx.documents = node.children
          .filter(_documentNode => _documentNode.name == "Document")
          .map(_documentNode => getDocument(_documentNode));
      else if (node.name == "Objects")
        fbx.objects.all = node.children.map(_objectNode => getObject(_objectNode, fbx));
      else if (node.name == "Connections")
        fbx.connections = node.children.map(_connectionNode => getConnection(_connectionNode));
      if (fbx.documents && fbx.objects.all && fbx.connections)
        break;
    }

    groupObjects(fbx);
    applyConnections(fbx.connections, fbx.documents, fbx.objects.all);

    return fbx;
  }

  function getDocument(_node: Node): Document {
    const document: Object = {
      uid: _node.properties[0] as number,
      name: _node.properties[2] as string,
      loaded: false,
      load: () => loadObjectProperties(_node, document)
    };
    return document;
  }

  function getObject(_node: Node, _fbx: FBX): Object {
    const nameAndType: string[] = (_node.properties[1] as string).split("::");
    const object: Object = {
      uid: _node.properties[0] as number,
      name: nameAndType[0],
      type: nameAndType[1],
      subtype: _node.properties[2] as string,
      loaded: false,
      load: () => loadObjectProperties(_node, object)
    };
    return object;
  }

  function groupObjects(_fbx: FBX): void {
    for (const object of _fbx.objects.all) {
      if (object.type == "Model")
        _fbx.objects.models.push(object);
      else if (object.type == "Geometry")
        _fbx.objects.geometries.push(object);
      else if (object.type == "Material")
        _fbx.objects.materials.push(object);
      else if (object.type == "Pose")
        _fbx.objects.poses.push(object);
      else if (object.type == "Texture")
        _fbx.objects.textures.push(object);
      else if (object.type == "AnimStack")
        _fbx.objects.animStacks.push(object);
    }
  }

  function getConnection(_node: Node): Connection {
    if (!(_node.properties[0] == "OO" || _node.properties[0] == "OP")) {
      console.warn(`Connection type ${_node.properties[0]} is not supported`);
      return null;
    }
    return {
      childUID: _node.properties[1] as number,
      parentUID: _node.properties[2] as number,
      propertyName: _node.properties[0] == "OP" ? _node.properties[3] as string : null
    };
  }

  function applyConnections(_connections: Connection[], _documents: Document[], _objects: Object[]): void {
    for (const connection of _connections) {
      let parent: Object = _documents.find(_document => _document.load().RootNode == connection.parentUID) as Object;
      let child: Object;
      for (const object of _objects) {
        if (parent == undefined && object.uid == connection.parentUID)
          parent = object;
        if (child == undefined && object.uid == connection.childUID)
          child = object;
        if (parent != undefined && child != undefined)
          break;
      }
      if (child)
        (child.parents || (child.parents = [])).push(parent);
      if (connection.propertyName == null)
        (parent.children || (parent.children = [])).push(child);
      else
        (parent as Object)[formatPropertyName(connection.propertyName)] = child;
    }
  }

  function loadObjectProperties(_node: Node, _object: Object): Object {
    if (_object.loaded)
      return _object;
    for (const child of _node.children) {
      if (child.name == "Properties70")
        for (const property70 of child.children) {
          const name: string = formatPropertyName(property70.properties[0] as string);
          if (!_object[name])
            _object[name] = getProperty70Value(property70);
        }
      else {
        const name: string = formatPropertyName(child.name);
        if (!_object[name])
          _object[name] = getPropertyValue(child);
      }
    }
    _object.loaded = true;
    return _object;
  }

  function getPropertyValue(_node: Node): NodeProperty | Object {
    return _node.children.length > 0
    ? _node.children.reduce(
      (_subProperties, _subProperty) => {
        const name: string = formatPropertyName(_subProperty.name);
        if (_subProperties[name] == undefined)
          _subProperties[name] = getPropertyValue(_subProperty);
        else {
          if (!(_subProperties[name] instanceof Array))
            _subProperties[name] = [_subProperties[name] as Object];
          (_subProperties[name] as Object[]).push(getPropertyValue(_subProperty) as Object);
        }
        return _subProperties;
      },
      {} as Object
    )
    : _node.properties[0];
  }

  function getProperty70Value(_node: Node): Property70 {
    switch (_node.properties[1] as string) {
      case "bool":
        return _node.properties[4] as boolean;

      case "int":
      case "enum":
      case "ULongLong":
      case "double":
      case "Number":
      case "FieldOfView":
        return _node.properties[4] as number;

      case "Color":
      case "ColorRGB":
      case "Vector3D":
      case "Lcl Translation":
      case "Lcl Rotation":
      case "Lcl Scaling":
        return new Vector3(..._node.properties.slice(4, 7) as number[]);
      
      case "KString":
      default:
        return _node.properties[4] as string;
    }
  }

  function formatPropertyName(_name: string): string {
    return _name.replace(/[^a-zA-Z]/, "");
  }

}