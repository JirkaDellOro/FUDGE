namespace FudgeCore.FBX {

  export function parseNodesFromBinary(_buffer: ArrayBuffer): FBX.Node[] {
    if (_buffer.byteLength < FBX.binaryStartChars.length)
      throw "Not a binary FBX file";
    
    const data: BufferReader = new BufferReader(_buffer);
    const firstChars: Uint8Array = new Uint8Array(data.getIterable(data.getUint8, FBX.binaryStartChars.length));
    const matchesFBXBinaryFirstChars: boolean
      = firstChars.every((_value, _index)  => _value == FBX.binaryStartChars[_index]);    
    if (!matchesFBXBinaryFirstChars)
      throw "Not a binary FBX file";

    const version: number = data.getUint32();
    const nodeAttributesAsUInt64: boolean = version >= 7500; // Warum >= 7500?
    const nodes: FBX.Node[] = [];
  
    while (true) {
      const node: FBX.Node = readNode(data, nodeAttributesAsUInt64);
      if (node == null) break;
      nodes.push(node);
    }
  
    return nodes;
  }

  function readNode(_data: BufferReader, _attributesAsUint64: boolean): FBX.Node {
    const endOffset: number = _attributesAsUint64 ? _data.getUint64() : _data.getUint32();
    if (endOffset == 0)
      return null;

    const nProperties: number = _attributesAsUint64 ? _data.getUint64() : _data.getUint32();
    const propertyListLength: number = _attributesAsUint64 ? _data.getUint64() : _data.getUint32();
    const nameLength: number = _data.getUint8();
    const name: string = _data.getString(nameLength);
    const propertiesEndOffset: number = _data.offset + propertyListLength;

    const node: FBX.Node = {
      name: name,
      properties: [],
      children: []
    };

    try {
      for (let iProperty: number = 0; iProperty < nProperties; iProperty++) {
        node.properties.push(readProperty(_data));
      }
      _data.offset = propertiesEndOffset;

      while (endOffset - _data.offset > 13) { // Warum größer 13?
        const child: FBX.Node = readNode(_data, _attributesAsUint64);
        if (child) node.children.push(child);
      }
      _data.offset = endOffset;
    } catch (e) {
      Debug.warn((e as Error).message);
    }

    return node;
  }

  function readProperty(_data: BufferReader): FBX.NodeProperty {
    const typeCode: string = _data.getChar();

    const value: FBX.NodeProperty = {
      C: _data.getBool,
      Y: _data.getInt16,
      I: _data.getInt32,
      L: _data.getInt64,
      F: _data.getFloat32,
      D: _data.getFloat64,
      S: () => _data.getString(_data.getUint32()).replace("\x00\x01", "::"),
      s: () => _data.getString(_data.getUint32()).replace("\x00\x01", "::"),
      R: () => new Uint8Array(readArray(_data, _data.getUint8)),
      r: () => new Uint8Array(readArray(_data, _data.getUint8)),
      b: () => new Uint8Array(readArray(_data, _data.getUint8)),
      i: () => new Uint16Array(readArray(_data, _data.getInt32)),
      l: () => new Uint16Array(readArray(_data, _data.getInt64)),
      f: () => new Float32Array(readArray(_data, _data.getFloat32)),
      d: () => new Float32Array(readArray(_data, _data.getFloat64))
    }[typeCode]?.call(_data);

    if (value == null)
      Debug.warn(`Unknown property type ${typeCode.charCodeAt(0)}`);
    
    return value;
  }

  function readArray(_data: BufferReader, _getter: () => number): Iterable<number> {
    const length: number = _data.getUint32();
    const encoding: FBX.ArrayEncoding = _data.getUint32();
    const byteLength: number = _data.getUint32();
    const endOffset: number = _data.offset + byteLength;
    let iterable: Iterable<number>;

    if (encoding == FBX.ArrayEncoding.COMPRESSED)
      //iterable = new BufferReader(inflate(_data.view.buffer.slice(_data.offset, endOffset))).getIterable(_getter, length);
      //iterable = new BufferReader(inflate(new Uint8Array([..._data.getIterable(_data.getUint8, byteLength)])).buffer).getIterable(_getter, length);
      Debug.warn("Decompression of array properties is not supported yet");
    else
      iterable = _data.getIterable(_getter, length);
    
    _data.offset = endOffset;

    return iterable;
  }

}