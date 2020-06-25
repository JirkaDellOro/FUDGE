namespace FudgeCore {
  /** Internal class for holding data about physics debug */
  export class PhysicsDebugVertexBuffer {
    public gl: WebGL2RenderingContext;
    public numVertices: number = 0;
    public attribs: Array<PhysicsDebugVertexAttribute>;
    public indices: Array<number>;
    public offsets: Array<number>;
    public stride: number;
    public buffer: WebGLBuffer;
    public dataLength: number;

    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.buffer = this.gl.createBuffer();
    }

    public setData(array: Array<number>): void {
      if (this.attribs == null) throw "set attributes first";
      this.numVertices = array.length / (this.stride / 4);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(array), this.gl.DYNAMIC_DRAW);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public updateData(array: Array<number>): void {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, new Float32Array(array));
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public updateDataFloat32Array(array: Float32Array) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferSubData(this.gl.ARRAY_BUFFER, 0, array);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }

    public setAttribs(attribs: Array<PhysicsDebugVertexAttribute>): void {
      this.attribs = attribs;
      this.offsets = [];
      this.stride = 0;
      var num = attribs.length;
      for (let i = 0; i < num; i++) {
        this.offsets.push(this.stride);
        this.stride += attribs[i].float32Count * Float32Array.BYTES_PER_ELEMENT; // 32bit float Bytes aer a constant of 4
      }
    }

    public loadAttribIndices(_program: PhysicsDebugShader) {
      this.indices = _program.getAttribIndices(this.attribs);
    }

    public bindAttribs() {
      if (this.indices == null) throw "indices are not loaded";
      var num = this.attribs.length;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      for (let i = 0; i < num; i++) {
        this.gl.enableVertexAttribArray(this.indices[i]);
        this.gl.vertexAttribPointer(this.indices[i], this.attribs[i].float32Count, this.gl.FLOAT, false, this.stride, this.offsets[i]);
      }
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null);
    }
  }

  /** Internal class for holding data about PhysicsDebugVertexBuffers */
  export class PhysicsDebugIndexBuffer {
    public gl: WebGL2RenderingContext;
    public buffer: WebGLBuffer;
    public count: number;

    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.buffer = this.gl.createBuffer();
    }

    public setData(array: Array<number>): void {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(array), this.gl.DYNAMIC_DRAW);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
      this.count = array.length;
    }

    public updateData(array: Array<number>): void {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, 0, new Int16Array(array));
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    public updateDataInt16Array(array: Int16Array): void {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.bufferSubData(this.gl.ELEMENT_ARRAY_BUFFER, 0, array);
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, null);
    }

    /** The actual DrawCall for physicsDebugDraw Buffers */
    public draw(_mode: number = this.gl.TRIANGLES, _count: number = -1): void {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.drawElements(_mode, _count >= 0 ? _count : this.count, this.gl.UNSIGNED_SHORT, 0);
    }
  }

  /** Internal class for managing data about webGL Attributes */
  export class PhysicsDebugVertexAttribute {
    public float32Count: number;
    public name: string;

    constructor(_float32Count: number, _name: string) {
      this.name = _name;
      this.float32Count = _float32Count;
    }
  }

  /** Internal class for Shaders only used by the physics debugDraw */
  export class PhysicsDebugShader {
    public gl: WebGL2RenderingContext;
    public program: WebGLProgram;
    public vertexShader: WebGLShader;
    public fragmentShader: WebGLShader;
    public uniformLocationMap: Map<string, WebGLUniformLocation>;

    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.program = this.gl.createProgram();
      this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    }


    public compile(vertexSource: string, fragmentSource: string): void {
      this.uniformLocationMap = new Map<string, WebGLUniformLocation>();
      this.compileShader(this.vertexShader, vertexSource);
      this.compileShader(this.fragmentShader, fragmentSource);
      this.gl.attachShader(this.program, this.vertexShader);
      this.gl.attachShader(this.program, this.fragmentShader);
      this.gl.linkProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
        Debug.log(this.gl.getProgramInfoLog(this.program));
      }
      this.gl.validateProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
        console.error('ERROR validating program!', this.gl.getProgramInfoLog(this.program));
        return;
      }
    }

    public getAttribIndex(_name: string): number {
      return this.gl.getAttribLocation(this.program, _name);
    }

    public getUniformLocation(_name: string): WebGLUniformLocation {
      if (this.uniformLocationMap.has(_name)) return this.uniformLocationMap.get(_name);
      var location: WebGLUniformLocation = this.gl.getUniformLocation(this.program, _name);
      this.uniformLocationMap.set(_name, location);
      return location;
    }

    public getAttribIndices(_attribs: Array<PhysicsDebugVertexAttribute>): Array<number> {
      var indices: Array<number> = [];
      _attribs.forEach(value => {
        indices.push(this.getAttribIndex(value.name));
      });
      return indices;
    }

    public use() {
      this.gl.useProgram(this.program);
    }

    public compileShader(shader: WebGLShader, source: string) {
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        Debug.log(this.gl.getShaderInfoLog(shader));
      }
    }
  }

  /** Internal Class used to draw debugInformations about the physics simulation onto the renderContext. @author Marko Fehrenbach | HFU 2020 //Based on OimoPhysics Haxe DebugDrawDemo */
  export class PhysicsDebugDraw extends RenderOperator {
    public oimoDebugDraw: OIMO.DebugDraw;
    public style: OIMO.DebugDrawStyle;
    public gl: WebGL2RenderingContext;

    public triangleBuffer: WebGLBuffer;
    public program: WebGLProgram;

    public pointVBO: PhysicsDebugVertexBuffer;
    public pointIBO: PhysicsDebugIndexBuffer;

    public lineVBO: PhysicsDebugVertexBuffer;
    public lineIBO: PhysicsDebugIndexBuffer;

    public triVBO: PhysicsDebugVertexBuffer;
    public triIBO: PhysicsDebugIndexBuffer;

    public pointBufferSize: number;
    public pointData: Float32Array;
    public numPointData: number;

    public lineBufferSize: number;
    public lineData: Float32Array;
    public numLineData: number;

    public triBufferSize: number;
    public triData: Float32Array;
    public numTriData: number;

    public shader: PhysicsDebugShader;

    constructor() {
      super();

      this.style = new OIMO.DebugDrawStyle();
      this.oimoDebugDraw = new OIMO.DebugDraw();
      this.oimoDebugDraw.wireframe = true;

      this.gl = RenderOperator.crc3;
      this.initializeOverride();
      this.shader = new PhysicsDebugShader(this.gl);
      this.shader.compile(this.vertexShaderSource(), this.fragmentShaderSource());
      this.initializeBuffers();
    }

    public getDebugModeFromSettings() {
      let mode: PHYSICS_DEBUGMODE = Physics.settings.debugMode;
      let elementsToDraw: boolean[] = new Array();
      switch (mode) {
        case 0: //Colliders and Bases
          elementsToDraw = [false, true, false, false, false, false, false, false, true];
          break;
        case 1: //Colliders and joints
          elementsToDraw = [false, false, false, false, false, true, true, false, true];
          break;
        case 2: //Bounding Box / Broadphase Bvh / Bases
          elementsToDraw = [true, true, true, false, false, false, false, false, false];
          break;
        case 3: //Contacts
          elementsToDraw = [false, true, false, true, true, false, false, true, true];
          break;
        case 4: //Physics Objects only, shows same as Collider / Joints but also hiding every other fudge object
          elementsToDraw = [false, true, false, false, false, true, true, false, true];
          break;
      }
      this.oimoDebugDraw.drawAabbs = elementsToDraw[0];
      this.oimoDebugDraw.drawBases = elementsToDraw[1];
      this.oimoDebugDraw.drawBvh = elementsToDraw[2];
      this.oimoDebugDraw.drawContactBases = elementsToDraw[3];
      this.oimoDebugDraw.drawContacts = elementsToDraw[4];
      this.oimoDebugDraw.drawJointLimits = elementsToDraw[5];
      this.oimoDebugDraw.drawJoints = elementsToDraw[6];
      this.oimoDebugDraw.drawPairs = elementsToDraw[7];
      this.oimoDebugDraw.drawShapes = elementsToDraw[8];

    }

    public initializeBuffers() {
      var attribs: Array<PhysicsDebugVertexAttribute> = [
        new PhysicsDebugVertexAttribute(3, "aPosition"),
        new PhysicsDebugVertexAttribute(3, "aNormal"),
        new PhysicsDebugVertexAttribute(3, "aColor")
      ];

      this.pointVBO = new PhysicsDebugVertexBuffer(this.gl);
      this.pointIBO = new PhysicsDebugIndexBuffer(this.gl);
      this.pointVBO.setAttribs(attribs);
      this.pointVBO.loadAttribIndices(this.shader);
      this.lineVBO = new PhysicsDebugVertexBuffer(this.gl);
      this.lineIBO = new PhysicsDebugIndexBuffer(this.gl);
      this.lineVBO.setAttribs(attribs);
      this.lineVBO.loadAttribIndices(this.shader);
      this.triVBO = new PhysicsDebugVertexBuffer(this.gl);
      this.triIBO = new PhysicsDebugIndexBuffer(this.gl);
      this.triVBO.setAttribs(attribs);
      this.triVBO.loadAttribIndices(this.shader);

      this.pointBufferSize = 4096;
      this.lineBufferSize = 4096;
      this.triBufferSize = 4096;
      this.pointData = new Float32Array(this.pointBufferSize * 9);
      this.lineData = new Float32Array(this.lineBufferSize * 9 * 2);
      this.triData = new Float32Array(this.triBufferSize * 9 * 3);

      this.initFloatArray(this.pointData);
      this.initFloatArray(this.lineData);
      this.initFloatArray(this.triData);

      var vbo: Array<number> = [];
      var ibo: Array<number> = [];
      for (let i = 0; i < this.pointBufferSize; i++) {
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb2
        ibo.push(i);
      }
      this.pointVBO.setData(vbo);
      this.pointIBO.setData(ibo);

      vbo = [];
      ibo = [];
      for (let i = 0; i < this.lineBufferSize; i++) {
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb2
        ibo.push(i * 2);
        ibo.push(i * 2 + 1);
      }
      this.lineVBO.setData(vbo);
      this.lineIBO.setData(ibo);

      vbo = [];
      ibo = [];
      for (let i = 0; i < this.triBufferSize; i++) {
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb1
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb2
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // pos3
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // nml3
        vbo.push(0);
        vbo.push(0);
        vbo.push(0); // rgb3
        ibo.push(i * 3);
        ibo.push(i * 3 + 1);
        ibo.push(i * 3 + 2);
      }
      this.triVBO.setData(vbo);
      this.triIBO.setData(ibo);
    }

    private initFloatArray(a: Float32Array): void {
      var num: number = a.length;
      for (let i = 0; i < num; i++) {
        a[i] = 0;
      }
    }


    private initializeOverride() {
      OIMO.DebugDraw.prototype.point = function (v: OIMO.Vec3, color: OIMO.Vec3) {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw;
        if (Physics.world.mainCam != null) {
          let idx: number = debugWrapper.numPointData * 9;
          let data: Float32Array = debugWrapper.pointData;
          data[idx++] = v.x;
          data[idx++] = v.y;
          data[idx++] = v.z;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          debugWrapper.numPointData++;

          if (debugWrapper.numPointData == debugWrapper.pointBufferSize) {
            debugWrapper.gl.uniform1f(debugWrapper.shader.getUniformLocation("ambient"), 0.2);
            debugWrapper.pointVBO.updateDataFloat32Array(debugWrapper.pointData);
            debugWrapper.pointVBO.bindAttribs();
            debugWrapper.pointIBO.draw(RenderOperator.crc3.POINTS);
            debugWrapper.numPointData = 0;
          }
        }
      }

      OIMO.DebugDraw.prototype.line = function (v1: OIMO.Vec3, v2: OIMO.Vec3, color: OIMO.Vec3) {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw;
        if (Physics.world.mainCam != null) {
          let idx: number = debugWrapper.numLineData * 18;
          let data: Float32Array = debugWrapper.lineData;
          data[idx++] = v1.x;
          data[idx++] = v1.y;
          data[idx++] = v1.z;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          data[idx++] = v2.x;
          data[idx++] = v2.y;
          data[idx++] = v2.z;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = 0;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          debugWrapper.numLineData++;

          if (debugWrapper.numLineData == debugWrapper.lineBufferSize) {
            debugWrapper.gl.uniform1f(debugWrapper.shader.getUniformLocation("ambient"), 0.2);
            debugWrapper.lineVBO.updateDataFloat32Array(debugWrapper.lineData);
            debugWrapper.lineVBO.bindAttribs();
            debugWrapper.lineIBO.draw(debugWrapper.gl.LINES);
            debugWrapper.numLineData = 0;
          }
        }
      }

      OIMO.DebugDraw.prototype.triangle = function (v1: OIMO.Vec3, v2: OIMO.Vec3, v3: OIMO.Vec3, n1: OIMO.Vec3, n2: OIMO.Vec3, n3: OIMO.Vec3, color: OIMO.Vec3) {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw;
        if (Physics.world.mainCam != null) {
          var idx: number = debugWrapper.numTriData * 27;
          var data: Float32Array = debugWrapper.triData;
          data[idx++] = v1.x;
          data[idx++] = v1.y;
          data[idx++] = v1.z;
          data[idx++] = n1.x;
          data[idx++] = n1.y;
          data[idx++] = n1.z;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          data[idx++] = v2.x;
          data[idx++] = v2.y;
          data[idx++] = v2.z;
          data[idx++] = n2.x;
          data[idx++] = n2.y;
          data[idx++] = n2.z;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          data[idx++] = v3.x;
          data[idx++] = v3.y;
          data[idx++] = v3.z;
          data[idx++] = n3.x;
          data[idx++] = n3.y;
          data[idx++] = n3.z;
          data[idx++] = color.x;
          data[idx++] = color.y;
          data[idx++] = color.z;
          debugWrapper.numTriData++;

          if (debugWrapper.numTriData == debugWrapper.triBufferSize) {
            debugWrapper.gl.uniform1f(debugWrapper.shader.getUniformLocation("ambient"), 1);
            debugWrapper.triVBO.updateDataFloat32Array(debugWrapper.triData);
            debugWrapper.triVBO.bindAttribs();
            debugWrapper.triIBO.draw(debugWrapper.gl.TRIANGLES);
            debugWrapper.numTriData = 0;
          }
        }

      }

    }

    public begin() {
      this.getDebugModeFromSettings();
      //this.gl.lineWidth(2.0); //Does not seem to affect anythign

      let projection: Float32Array = Physics.world.mainCam.ViewProjectionMatrix.get();
      this.gl.uniformMatrix4fv(this.shader.getUniformLocation("u_projection"), false, projection);

      this.numPointData = 0;
      this.numLineData = 0;
      this.numTriData = 0;
    }

    public end() {
      this.shader.use();

      if (this.numPointData > 0) {
        this.pointVBO.updateDataFloat32Array(this.pointData);
        this.pointVBO.bindAttribs();
        this.pointIBO.draw(this.gl.POINTS, this.numPointData);
        this.numPointData = 0;
      }
      if (this.numLineData > 0) {
        this.lineVBO.updateDataFloat32Array(this.lineData);
        this.lineVBO.bindAttribs();
        this.lineIBO.draw(this.gl.LINES, this.numLineData * 2);
        this.numLineData = 0;
      }


      if (this.numTriData > 0) {
        this.triVBO.updateDataFloat32Array(this.triData);
        this.triVBO.bindAttribs();
        this.triIBO.draw(this.gl.TRIANGLES, this.numTriData * 3);
        this.numTriData = 0;
      }
    }

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
				gl_Position = u_projection * vec4(aPosition,1.0);
				gl_PointSize = 6.0;
			}`

    }

    private fragmentShaderSource(): string { //Small Shader - Unlit
      return `
      precision mediump float;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;
			uniform float ambient;

			void main() {
				vec3 normal = length(vNormal) > 0.0 ? normalize(vNormal) : vec3(0.0, 0.0, 0.0);
				gl_FragColor = vec4(vColor, 1.0);
			}`
    }
  }


}

