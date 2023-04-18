declare let pako = {
  inflate(_data: Uint8Array): Uint8Array;
}

declare let fflate = {
  inflateSync(_data: Uint8Array, _out?: Uint8Array): Uint8Array;
}