namespace WebEngine{
    
    /**
     * Small interface used by Material- and Mesh-classes to store datapullspecifications
     * for a WebGLBuffer.
     */
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
}