// Modified copy from https://github.com/picode7/binary-reader
namespace FudgeCore.FBX {
  export class BufferReader {
    public offset: number;
    public readonly view: DataView;

    public constructor(_buffer: ArrayBuffer) {
      this.view = new DataView(_buffer);
      this.offset = 0;
    }

    public getChar(_offset: number = this.offset): string {
      return String.fromCharCode(this.getUint8(_offset));
    }

    public getBool(_offset: number = this.offset): boolean {
      return this.getUint8(_offset) != 0;
    }

    public getUint8(_offset: number = this.offset): number {
      this.offset = _offset + 1;
      return this.view.getUint8(_offset);
    }

    public getUint32(_offset: number = this.offset): number {
      this.offset = _offset + 4;
      return this.view.getUint32(_offset, true);
    }

    public getUint64(_offset: number = this.offset): number {
      this.offset = _offset + 8;
      return Number(this.view.getBigUint64(_offset, true));
    }

    public getInt16(_offset: number = this.offset): number {
      this.offset = _offset + 2;
      return this.view.getInt16(_offset, true);
    }

    public getInt32(_offset: number = this.offset): number {
      this.offset = _offset + 4;
      return this.view.getInt32(_offset, true);
    }

    public getInt64(_offset: number = this.offset): number {
      this.offset = _offset + 8;
      return Number(this.view.getBigInt64(_offset, true));
    }

    public getFloat32(_offset: number = this.offset): number {
      this.offset = _offset + 4;
      return this.view.getFloat32(_offset, true);
    }

    public getFloat64(_offset: number = this.offset): number {
      this.offset = _offset + 8;
      return this.view.getFloat64(_offset, true);
    }

    public getString(_length: number, _offset: number = this.offset): string {
      return String.fromCharCode(...this.getSequence(this.getUint8, _length, _offset));
    }

    public *getSequence(_getter: () => number, _length: number, _offset: number = this.offset): Generator<number> {
      this.offset = _offset;
      for (let i: number = 0; i < _length; i++) {
        yield _getter.call(this);
      }
    }
  }
}