namespace FudgeCore {
  export class PhysicsDebugDraw extends RenderOperator { // extends OIMO.DebugDraw { //can't extend from OIMO.DebugDraw since it might or might not be loaded. So it needs to be structured like DebugDraw, to be cast as one.
    // needs to get Oimo Debug Draw informations and such and give em to the Fudge Draw buffer
    public oimoDebugDraw: OIMO.DebugDraw;
    public style: OIMO.DebugDrawStyle;
    public drawAabbs: boolean = true;
    public drawJoints: boolean = true;

    public triangleBuffer: WebGLBuffer;
    public program: WebGLProgram;

    private vertShader: WebGLShader;
    private fragmentShader: WebGLShader;

    constructor() {
      super();
      this.style = new OIMO.DebugDrawStyle();
      this.oimoDebugDraw = new OIMO.DebugDraw();

      this.initializeOverride();
    }

    public drawTestTriangle(_cmpCamera: ComponentCamera): void {
      RenderOperator.crc3.useProgram(this.program);
      let matProjAttri = RenderOperator.crc3.getUniformLocation(this.program, 'u_projection');
      let projection = _cmpCamera.ViewProjectionMatrix.get();
      RenderOperator.crc3.uniformMatrix4fv(matProjAttri, false, projection);
      RenderOperator.crc3.drawArrays(RenderOperator.crc3.TRIANGLES, 0, 3);
    }

    private initializeOverride() {
      OIMO.DebugDraw.prototype.point = function (v: OIMO.Vec3, color: OIMO.Vec3) {
        //Initialize Buffers, Bind Buffers and make the draw call
      }

      OIMO.DebugDraw.prototype.line = function (v1: OIMO.Vec3, v2: OIMO.Vec3, color: OIMO.Vec3) {

      }

      OIMO.DebugDraw.prototype.triangle = function (v1: OIMO.Vec3, v2: OIMO.Vec3, v3: OIMO.Vec3, n1: OIMO.Vec3, n2: OIMO.Vec3, n3: OIMO.Vec3, color: OIMO.Vec3) {

      }
      //RenderOperator.crc3.uniformMatrix4fv(shader.getUniformLocation(name), false, matrix.toArray(true));
      //RenderOperator.crc3.uniform3f(shader.getUniformLocation(name), v.x, v.y, v.z);

      //STEPS, for WebGL Rendering

      //Create and Setup Shaders
      this.vertShader = RenderOperator.crc3.createShader(RenderOperator.crc3.VERTEX_SHADER);
      this.fragmentShader = RenderOperator.crc3.createShader(RenderOperator.crc3.FRAGMENT_SHADER);
      RenderOperator.crc3.shaderSource(this.vertShader, this.vertexShaderTestSource());
      RenderOperator.crc3.shaderSource(this.fragmentShader, this.fragmentShaderTestSource());


      RenderOperator.crc3.compileShader(this.vertShader);
      if (!RenderOperator.crc3.getShaderParameter(this.vertShader, RenderOperator.crc3.COMPILE_STATUS)) {
        console.error('ERROR compiling vertex shader!', RenderOperator.crc3.getShaderInfoLog(this.vertShader));
        return;
      }
      RenderOperator.crc3.compileShader(this.fragmentShader);
      if (!RenderOperator.crc3.getShaderParameter(this.fragmentShader, RenderOperator.crc3.COMPILE_STATUS)) {
        console.error('ERROR compiling fragment shader!', RenderOperator.crc3.getShaderInfoLog(this.fragmentShader));
        return;
      }
      // Create Program

      this.program = RenderOperator.crc3.createProgram();
      RenderOperator.crc3.attachShader(this.program, this.vertShader);
      RenderOperator.crc3.attachShader(this.program, this.fragmentShader);
      RenderOperator.crc3.linkProgram(this.program);
      if (!RenderOperator.crc3.getProgramParameter(this.program, RenderOperator.crc3.LINK_STATUS)) {
        console.error('ERROR linking program!', RenderOperator.crc3.getProgramInfoLog(this.program));
        return;
      }
      RenderOperator.crc3.validateProgram(this.program);
      if (!RenderOperator.crc3.getProgramParameter(this.program, RenderOperator.crc3.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', RenderOperator.crc3.getProgramInfoLog(this.program));
        return;
      }

      let triangleVertices: number[] =
        [ // X, Y,       R, G, B
          0.0, 3.5, 1.0, 1.0, 0.0,
          -0.5, -3.5, 0.7, 0.0, 1.0,
          0.5, -3.5, 0.1, 1.0, 0.6
        ];

      // Create/BindBuffers - Buffers need to be set for every Point/Line/Triangle thing
      this.triangleBuffer = RenderOperator.crc3.createBuffer();
      RenderOperator.crc3.bindBuffer(RenderOperator.crc3.ARRAY_BUFFER, this.triangleBuffer);
      RenderOperator.crc3.bufferData(RenderOperator.crc3.ARRAY_BUFFER, new Float32Array(triangleVertices), RenderOperator.crc3.DYNAMIC_DRAW);

      // Buffer Attributes - For Attributes - Get Uniforms/Attributes in form of Projection Matrix and such
      let posAttri: number = RenderOperator.crc3.getAttribLocation(this.program, "vertPosition");
      let colorAttri: number = RenderOperator.crc3.getAttribLocation(this.program, "vertColor");
      RenderOperator.crc3.vertexAttribPointer(
        posAttri,
        2, //Num Elements per Vert
        RenderOperator.crc3.FLOAT, //Element Type
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual Vertex, BytesPerElement is a constant of 4
        0 //Start Skip per Array
      );
      RenderOperator.crc3.enableVertexAttribArray(posAttri);


      RenderOperator.crc3.vertexAttribPointer(
        colorAttri,
        2, //Num Elements per Vert
        RenderOperator.crc3.FLOAT, //Element Type
        false,
        5 * Float32Array.BYTES_PER_ELEMENT, //Size of an individual Vertex, BytesPerElement is a constant of 4
        2 * Float32Array.BYTES_PER_ELEMENT //Start Skip per Array
      );
      RenderOperator.crc3.enableVertexAttribArray(colorAttri);
      RenderOperator.crc3.useProgram(this.program);
    }

    //TODO Vertex/Fragment Shader changes bases on Fudge Matrix/Cam Projection Setup
    // Only need u_Projection because rest is already calculated? World and View?
    //let projection: Matrix4x4 = Matrix4x4.MULTIPLICATION(_cmpCamera.ViewProjectionMatrix, finalTransform); kinda includes Word/ViewMatrix
    //Basic Functionality after https://www.youtube.com/watch?v=3yLL9ADo-ko&t=808s
    //look at other fudge shaders and reproduce
    private vertexShaderSource(): string {
      return `
			precision mediump float;
			attribute vec3 aPosition;
			attribute vec3 aColor;
			attribute vec3 aNormal;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;
			uniform mat4 u_projection;
			uniform mat4 viewMat;
			uniform mat4 projMat;

			void main() {
				vPosition = aPosition;
				vColor = aColor;
				vNormal = aNormal;
				gl_Position = u_projection * vec4(vertPosition,1.0);
				gl_PointSize = 6.0;
			}`

    }

    private fragmentShaderSource(): string { //Smaller the shader, no need for things like brightness and such
      return `
      precision mediump float;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;
			uniform vec3 lightDir;
			uniform vec3 lightCol;
			uniform vec3 cameraPos;
			uniform float ambient;
			uniform float diffuse;
			uniform float specular;
			uniform float shininess;

			void main() {
				vec3 normal = length(vNormal) > 0.0 ? normalize(vNormal) : vec3(0.0, 0.0, 0.0);
				vec3 dir = normalize(lightDir);
				float d = -dot(dir, normal);
				float brightness = max(0.0, d) * diffuse;
				vec3 eye = normalize(vPosition - cameraPos);
				vec3 pixColor = vColor * min(1.0, ambient + diffuse * brightness);
				if (d > 0.0) {
					d = -dot(dir, reflect(eye, normal));
					pixColor += lightCol * specular * pow(max(0.0, d), shininess);
				}
				gl_FragColor = vec4(pixColor, 1.0);
			}`
    }

    private vertexShaderTestSource(): string {
      return `
      precision mediump float;
      attribute vec2 vertPosition;
      attribute vec3 vertColor;
      varying vec3 fragColor;

      uniform mat4 u_projection;

      void main(){
        fragColor = vertColor;
        gl_Position = u_projection * vec4(vertPosition, 0.0,1.0);
      }
      `
    }

    private fragmentShaderTestSource(): string {
      return `
    precision mediump float;
    varying vec3 fragColor;
    void main(){
      gl_FragColor = vec4(fragColor, 1.0);
    }
      `
    }

  }


}

