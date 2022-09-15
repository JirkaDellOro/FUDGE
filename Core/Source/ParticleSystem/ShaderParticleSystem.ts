namespace FudgeCore {

  @RenderInjectorShaderParticleSystem.decorate
  export class ShaderParticleSystem implements ShaderInterface {
    public data: ParticleData.System;
    public define: string[] = [ "PARTICLE" ];
    public vertexShaderSource: string;
    public fragmentShaderSource: string;

    public program: WebGLProgram;
    public attributes: { [name: string]: number };
    public uniforms: { [name: string]: WebGLUniformLocation };

    public getVertexShaderSource(): string { return ""; /* injected by decorator */ }
    public getFragmentShaderSource(): string { return ""; /* injected by decorator */ }
    public deleteProgram(): void {/* injected by decorator */ }
    public useProgram(): void {/* injected by decorator */ }
    public createProgram(): void {/* injected by decorator */ }
  }
}