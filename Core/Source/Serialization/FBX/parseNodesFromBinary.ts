namespace FudgeCore.FBX {
  /**
   * Parses fbx-nodes array from a binary fbx-file.
   * despite the lazy node implementation it is mostly a copy of the reference: https://github.com/picode7/fbx-parser
   * @author Matthias Roming, HFU, 2023
   */
  export function parseNodesFromBinary(_buffer: ArrayBuffer): Node[] {
    if (_buffer.byteLength < binaryStartChars.length)
      throw "Not a binary FBX file";
    
    const data: BufferReader = new BufferReader(_buffer);
    const firstChars: Uint8Array = new Uint8Array(data.getSequence(data.getUint8, binaryStartChars.length));
    const matchesFBXBinaryFirstChars: boolean
      = firstChars.every((_value, _index)  => _value == binaryStartChars[_index]);    
    if (!matchesFBXBinaryFirstChars)
      throw "Not a binary FBX file";

    const version: number = data.getUint32();
    const nodeAttributesAsUInt64: boolean = version >= 7500; // Warum >= 7500?
    const nodes: Node[] = [];
  
    while (true) {
      const node: Node = readNode(data, nodeAttributesAsUInt64);
      if (node == null) break;
      nodes.push(node);
    }
  
    return nodes;
  }

  function readNode(_data: BufferReader, _attributesAsUint64: boolean): Node {
    const endOffset: number = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
    if (endOffset == 0)
      return null;

    const propertiesLength: number = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
    const propertiesByteLength: number = _attributesAsUint64 ? Number(_data.getUint64()) : _data.getUint32();
    const nameLength: number = _data.getUint8();
    const name: string = _data.getString(nameLength);
    const propertiesOffset: number = _data.offset;
    const childrenOffset: number = propertiesOffset + propertiesByteLength;

    const node: Node = new Node(
      name,
      () => {
        _data.offset = propertiesOffset;
        const properties: NodeProperty[] = [];
        for (let iProperty: number = 0; iProperty < propertiesLength; iProperty++) {
          properties.push(readProperty(_data));
        }
        return properties;
      }, 
      () => {
        _data.offset = childrenOffset;
        const children: Node[] = [];
        while (endOffset - _data.offset > nullCountAtNodeEnd) {
          const child: FBX.Node = readNode(_data, _attributesAsUint64);
          if (child) children.push(child);
        }
        return children;
      }
    );
    
    _data.offset = endOffset;

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
      R: () => new Uint8Array(readRaw(_data, _data.getUint8)),
      r: () => new Uint8Array(readArray(_data, _data.getUint8)),
      b: () => new Uint8Array(readArray(_data, _data.getUint8)),
      i: () => new Int32Array(readArray(_data, _data.getInt32)),
      l: () => new BigInt64Array(readArray(_data, _data.getInt64)),
      f: () => new Float32Array(readArray(_data, _data.getFloat32)),
      d: () => new Float32Array(readArray(_data, _data.getFloat64))
    }[typeCode]?.call(_data);

    if (value == null)
      Debug.warn(`Unknown property type ${typeCode.charCodeAt(0)}`);
    
    return value;
  }

  function readArray<T extends number | bigint>(_data: BufferReader, _getter: () => T): Generator<T> {
    const length: number = _data.getUint32();
    const encoding: FBX.ArrayEncoding = _data.getUint32();
    const byteLength: number = _data.getUint32();
    const endOffset: number = _data.offset + byteLength;

    const iterable: Generator<T> = encoding == FBX.ArrayEncoding.COMPRESSED ?
      (() => {
        const arrayData: Uint8Array = new Uint8Array(_data.view.buffer, _data.offset, byteLength);
        const inflatedData: Uint8Array = (Reflect.get(globalThis, "pako") ? pako.inflate : fflate.inflateSync)(arrayData);
        return new BufferReader(inflatedData.buffer).getSequence(_getter, length);
      })() :
      _data.getSequence(_getter, length);
    
    _data.offset = endOffset;

    return iterable;
  }

  function readRaw<T extends number | bigint>(_data: BufferReader, _getter: () => T): Generator<T> {
    // raw binary data needs to be interpreted in a special way see:
    // https://code.blender.org/2013/08/fbx-binary-file-format-specification/
    const length: number = _data.getUint32();
    return _data.getSequence(_getter, length);;
  }

  const binaryStartChars: Uint8Array
    = Uint8Array.from("Kaydara FBX Binary\x20\x20\x00\x1a\x00".split(""), (v) => v.charCodeAt(0));

  const nullCountAtNodeEnd: number = 13;

}