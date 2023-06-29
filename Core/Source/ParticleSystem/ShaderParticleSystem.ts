namespace FudgeCore {

  /**
   * A WebGL shaderprogram for a particle system. Managed by a {@link ParticleSystem}. It uses {@link ParticleSystem.data} to generate and inject code into a shader universal derivate (GLSL) thus creating a shader particle system from a supplied {@link Shader}s vertex and fragment shader source code.
   * @author Jonas Plotzky, HFU, 2022
   * @internal
   */
  @RenderInjectorShaderParticleSystem.decorate
  export class ShaderParticleSystem implements ShaderInterface {
    public data: ParticleData.System;
    public define: string[] = ["PARTICLE"];
    public vertexShaderSource: string;
    public fragmentShaderSource: string;

    public program: WebGLProgram;
    public attributes: { [name: string]: number };
    public uniforms: { [name: string]: WebGLUniformLocation };

    /**
     * Injected by {@link RenderInjectorShaderParticleSystem}. Used by the render system.
     * @internal
     */
    public getVertexShaderSource(): string { return ""; /* injected by decorator */ }

    /**
     * Injected by {@link RenderInjectorShaderParticleSystem}. Used by the render system.
     * @internal
     */
    public getFragmentShaderSource(): string { return ""; /* injected by decorator */ }

    /**
     * Injected by {@link RenderInjectorShaderParticleSystem}. Used by the render system.
     * @internal
     */
    public deleteProgram(): void {/* injected by decorator */ }

    /**
     * Injected by {@link RenderInjectorShaderParticleSystem}. Used by the render system.
     * @internal
     */
    public useProgram(): void {/* injected by decorator */ }

    /**
     * Injected by {@link RenderInjectorShaderParticleSystem}. Used by the render system.
     * @internal
     */
    public createProgram(): void {/* injected by decorator */ }
  }
}