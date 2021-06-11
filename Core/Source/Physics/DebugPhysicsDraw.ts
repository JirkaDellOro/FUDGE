namespace FudgeCore {
  /** Internal class for holding data about physics debug vertices.*/
  export class PhysicsDebugVertexBuffer {
    public gl: WebGL2RenderingContext;
    public numVertices: number = 0;
    public attribs: Array<PhysicsDebugVertexAttribute>;
    public indices: Array<number>;
    public offsets: Array<number>;
    public stride: number;
    public buffer: WebGLBuffer;
    public dataLength: number;

    /** Setup the rendering context for this buffer and create the actual buffer for this context. */
    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.buffer = this.gl.createBuffer();
    }

    /** Fill the bound buffer with data. Used at buffer initialization */
    public setData(array: Array<number>): void {
      if (this.attribs == null) throw "set attributes first";
      this.numVertices = array.length / (this.stride / 4);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(array), this.gl.DYNAMIC_DRAW);
      //not necessary an in webgl2 anymore to rebind the same last buffer (which is achieved by giving a null buffer), after buffer is changed. Removed it on all other occasions
      // this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null); 
    }

    /** Set Shader Attributes informations by getting their position in the shader, setting the offset, stride and size. For later use in the binding process */
    public setAttribs(attribs: Array<PhysicsDebugVertexAttribute>): void {
      this.attribs = attribs;
      this.offsets = [];
      this.stride = 0;
      let n: number = attribs.length;
      for (let i: number = 0; i < n; i++) {
        this.offsets.push(this.stride);
        this.stride += attribs[i].float32Count * Float32Array.BYTES_PER_ELEMENT; // 32bit float Bytes are a constant of 4
      }
    }

    /** Get the position of the attribute in the shader */
    public loadAttribIndices(_program: PhysicsDebugShader): void {
      this.indices = _program.getAttribIndices(this.attribs);
    }

    /** Enable a attribute in a shader for this context, */
    public bindAttribs(): void {
      if (this.indices == null) throw "indices are not loaded";
      let n: number = this.attribs.length;
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer); //making the buffer of this class the current buffer
      for (let i: number = 0; i < n; i++) {
        this.gl.enableVertexAttribArray(this.indices[i]); //enable the Attribute
        this.gl.vertexAttribPointer(this.indices[i], this.attribs[i].float32Count, this.gl.FLOAT, false, this.stride, this.offsets[i]); //creates a pointer and structure for this attribute
      }
    }
  }

  /** Internal class for holding data about PhysicsDebugVertexBuffers */
  export class PhysicsDebugIndexBuffer {
    public gl: WebGL2RenderingContext;
    public buffer: WebGLBuffer;
    public count: number;

    /** Setup the rendering context for this buffer and create the actual buffer for this context. */
    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.buffer = this.gl.createBuffer();
    }

    /** Fill the bound buffer with data amount. Used at buffer initialization */
    public setData(array: Array<number>): void {
      this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.buffer);
      this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Int16Array(array), this.gl.DYNAMIC_DRAW);
      this.count = array.length;
    }

    /** The actual DrawCall for physicsDebugDraw Buffers. This is where the information from the debug is actually drawn. */
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

  /** Internal class for Shaders used only by the physics debugDraw */
  export class PhysicsDebugShader {
    public gl: WebGL2RenderingContext;
    public program: WebGLProgram;
    public vertexShader: WebGLShader;
    public fragmentShader: WebGLShader;
    public uniformLocationMap: Map<string, WebGLUniformLocation>;

    /** Introduce the Fudge Rendering Context to this class, creating a program and vertex/fragment shader in this context */
    constructor(_renderingContext: WebGL2RenderingContext) {
      this.gl = _renderingContext;
      this.program = this.gl.createProgram();
      this.vertexShader = this.gl.createShader(this.gl.VERTEX_SHADER);
      this.fragmentShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);
    }

    /** Take glsl shaders as strings and compile them, attaching the compiled shaders to a program thats used by this rendering context. */
    public compile(vertexSource: string, fragmentSource: string): void {
      this.uniformLocationMap = new Map<string, WebGLUniformLocation>();
      this.compileShader(this.vertexShader, vertexSource);
      this.compileShader(this.fragmentShader, fragmentSource);
      this.gl.attachShader(this.program, this.vertexShader);
      this.gl.attachShader(this.program, this.fragmentShader);
      this.gl.linkProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {  //make sure the linking worked, so the program is valid, and shaders are working
        Debug.log(this.gl.getProgramInfoLog(this.program));
      }
      this.gl.validateProgram(this.program);
      if (!this.gl.getProgramParameter(this.program, this.gl.VALIDATE_STATUS)) {
        console.error("ERROR validating program!", this.gl.getProgramInfoLog(this.program));
        return;
      }
    }

    /** Get index of a attribute in a shader in this program */
    public getAttribIndex(_name: string): number {
      return this.gl.getAttribLocation(this.program, _name);
    }

    /** Get the location of a uniform in a shader in this program */
    public getUniformLocation(_name: string): WebGLUniformLocation {
      if (this.uniformLocationMap.has(_name)) return this.uniformLocationMap.get(_name);
      let location: WebGLUniformLocation = this.gl.getUniformLocation(this.program, _name);
      this.uniformLocationMap.set(_name, location);
      return location;
    }

    /** Get all indices for every attribute in the shaders of this program */
    public getAttribIndices(_attribs: Array<PhysicsDebugVertexAttribute>): Array<number> {
      let indices: Array<number> = [];
      _attribs.forEach(value => {
        indices.push(this.getAttribIndex(value.name));
      });
      return indices;
    }

    /** Tell the Fudge Rendering Context to use this program to draw. */
    public use(): void {
      this.gl.useProgram(this.program);
    }

    /** Compile a shader out of a string and validate it. */
    public compileShader(shader: WebGLShader, source: string): void {
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
        Debug.log(this.gl.getShaderInfoLog(shader));
      }
    }
  }

  /** Internal Class used to draw debugInformations about the physics simulation onto the renderContext. No user interaction needed. 
   * @author Marko Fehrenbach, HFU 2020 //Based on OimoPhysics Haxe DebugDrawDemo 
   */
  export class PhysicsDebugDraw extends RenderWebGL {
    public oimoDebugDraw: OIMO.DebugDraw; //the original physics engine debugDraw class receiving calls from the oimoPhysics.World, and providing informations in form of points/lines/triangles what the physics world looks like
    public style: OIMO.DebugDrawStyle; //colors of the debug informations, unchanged in Fudge integration, basically coloring things like sleeping/active rb's differently, joints white and such. No need to have users change anything.
    public gl: WebGL2RenderingContext;

    public program: WebGLProgram; //program that is used in the Fudge rendering context containing shaders and use informations for the context to know how to draw
    public shader: PhysicsDebugShader;

    //Buffers for points/lines/triangles. Index Buffer for the amount of drawCalls and Vertex Buffer for the informations
    public pointVBO: PhysicsDebugVertexBuffer;
    public pointIBO: PhysicsDebugIndexBuffer;

    public lineVBO: PhysicsDebugVertexBuffer;
    public lineIBO: PhysicsDebugIndexBuffer;

    public triVBO: PhysicsDebugVertexBuffer;
    public triIBO: PhysicsDebugIndexBuffer;

    public pointData: Array<number>;
    public pointIboData: Array<number>;
    public numPointData: number;

    public lineData: Array<number>;
    public lineIboData: Array<number>;
    public numLineData: number;

    public triData: Array<number>;
    public triIboData: Array<number>;
    public numTriData: number;

    /** Creating the debug for physics in Fudge. Tell it to draw only wireframe objects, since Fudge is handling rendering of the objects besides physics. 
     * Override OimoPhysics Functions with own rendering. Initialize buffers and connect them with the context for later use. */
    constructor() {
      super();

      this.style = new OIMO.DebugDrawStyle();
      this.oimoDebugDraw = new OIMO.DebugDraw();
      this.oimoDebugDraw.wireframe = true; //Triangle Rendering is handled by FUDGE so, only the physics lines/points need to be rendered, although triangle is still implemented

      this.gl = RenderWebGL.crc3;
      this.initializeOverride();
      this.shader = new PhysicsDebugShader(this.gl);
      this.shader.compile(this.vertexShaderSource(), this.fragmentShaderSource());

      this.initializeBuffers();
    }

    /** Receive the current DebugMode from the physics settings and set the OimoPhysics.DebugDraw booleans to show only certain informations.
     * Needed since some debug informations exclude others, and can't be drawn at the same time, by OimoPhysics. And for users it provides more readability
     * to debug only what they need and is commonly debugged.
     */
    public getDebugModeFromSettings(): void {
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

    /** Creating the empty render buffers. Defining the attributes used in shaders.
     * Needs to create empty buffers to already have them ready to draw later on, linking is only possible with existing buffers. */
    public initializeBuffers(): void {
      let attribs: Array<PhysicsDebugVertexAttribute> = [
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

      this.clearBuffers();
    }

    /** Before OimoPhysics.world is filling the debug. Make sure the buffers are reset. Also receiving the debugMode from settings and updating the current projection for the vertexShader. */
    public clearBuffers(): void {
      this.gl.lineWidth(2.0); //Does not affect anything because lineWidth is currently only supported by Microsoft Edge and Fudge is optimized for Chrome

      this.pointData = []; //Resetting the data to be filled again
      this.lineData = [];
      this.triData = [];

      this.numPointData = 0; //Resetting the amount of data calls
      this.numLineData = 0;
      this.numTriData = 0;
    }

    /** After OimoPhysics.world filled the debug. Rendering calls. Setting this program to be used by the Fudge rendering context. And draw each updated buffer and resetting them. */
    public drawBuffers(): void {
      this.shader.use();
      let projection: Float32Array = Physics.world.mainCam.mtxWorldToView.get();
      this.gl.uniformMatrix4fv(this.shader.getUniformLocation("u_projection"), false, projection);


      if (this.numPointData > 0) {
        this.pointIboData = [];  //Buffer size matching to whats needed
        for (let i: number = 0; i < this.numPointData; i++) {
          this.pointIboData.push(i);
        }
        this.pointIBO.setData(this.pointIboData); //Set Index buffer to correct size
        this.pointVBO.setData(this.pointData); //Set Vertex Buffer to current Data
        this.pointVBO.bindAttribs();
        this.pointIBO.draw(this.gl.POINTS, this.numPointData); //The actual draw call for each index in ibo
        this.numPointData = 0;
      }
      if (this.numLineData > 0) {
        this.lineIboData = [];
        for (let i: number = 0; i < this.numLineData; i++) {
          this.lineIboData.push(i * 2);
          this.lineIboData.push(i * 2 + 1);
        }
        this.lineIBO.setData(this.lineIboData);
        this.lineVBO.setData(this.lineData);
        this.lineVBO.bindAttribs();
        this.lineIBO.draw(this.gl.LINES, this.numLineData * 2);
        this.numLineData = 0;
      }
      if (this.numTriData > 0) {
        this.triIboData = [];
        for (let i: number = 0; i < this.numTriData; i++) {
          this.triIboData.push(i * 3);
          this.triIboData.push(i * 3 + 1);
          this.triIboData.push(i * 3 + 2);
        }
        this.triIBO.setData(this.triIboData);
        this.triVBO.setData(this.triData);
        this.triVBO.bindAttribs();
        this.triIBO.draw(this.gl.TRIANGLES, this.numTriData * 3);
        this.numTriData = 0;
      }
    }

    /** Drawing the ray into the debugDraw Call. By using the overwritten line rendering functions and drawing a point (pointSize defined in the shader) at the end of the ray. */
    public debugRay(_origin: Vector3, _end: Vector3, _color: Color): void {
      this.oimoDebugDraw.line(new OIMO.Vec3(_origin.x, _origin.y, _origin.z), new OIMO.Vec3(_end.x, _end.y, _end.z), new OIMO.Vec3(_color.r, _color.g, _color.b));
      this.oimoDebugDraw.point(new OIMO.Vec3(_end.x, _end.y, _end.z), new OIMO.Vec3(_color.r, _color.g, _color.b));
    }

    /** Overriding the existing functions from OimoPhysics.DebugDraw without actually inherit from the class, to avoid compiler problems. 
     * Overriding them to receive debugInformations in the format the physic engine provides them but handling the rendering in the fudge context. */
    private initializeOverride(): void {
      //Override point/line/triangle functions of OimoPhysics which are used to draw wireframes of objects, lines of raycasts or triangles when the objects are rendered by the physics not FUDGE (unused)

      OIMO.DebugDraw.prototype.point = function (_v: OIMO.Vec3, _color: OIMO.Vec3): void {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw; //Get the custom physics debug class to have access to the data.
        if (Physics.world.mainCam != null) { //only act when there is a camera that is rendering
          let data: Array<Number> = debugWrapper.pointData; //get the already written buffer informations
          data.push(_v.x, _v.y, _v.z); //Coordinates of the point
          data.push(0, 0, 0); //Point Normals - Empty since it's not a polygon
          data.push(_color.x, _color.y, _color.z); //Color of the point
          debugWrapper.numPointData++;
        }
      };

      OIMO.DebugDraw.prototype.line = function (_v1: OIMO.Vec3, _v2: OIMO.Vec3, _color: OIMO.Vec3): void {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw;
        if (Physics.world.mainCam != null) {
          let data: Array<number> = debugWrapper.lineData;
          data.push(_v1.x, _v1.y, _v1.z); //Point 1 Coordinates
          data.push(0, 0, 0); //P1 Normals - Empty since it's not a polygon
          data.push(_color.x, _color.y, _color.z); //P1 Color
          data.push(_v2.x, _v2.y, _v2.z); //Point 2 Coordinates
          data.push(0, 0, 0);
          data.push(_color.x, _color.y, _color.z);
          debugWrapper.numLineData++;
        }
      };

      OIMO.DebugDraw.prototype.triangle = function (_v1: OIMO.Vec3, _v2: OIMO.Vec3, _v3: OIMO.Vec3, _n1: OIMO.Vec3, _n2: OIMO.Vec3, _n3: OIMO.Vec3, _color: OIMO.Vec3): void {
        let debugWrapper: PhysicsDebugDraw = Physics.world.debugDraw;
        if (Physics.world.mainCam != null) {
          let data: Array<number> = debugWrapper.triData;
          data.push(_v1.x, _v1.y, _v1.z);
          data.push(_n1.x, _n1.y, _n1.z);
          data.push(_color.x, _color.y, _color.z);
          data.push(_v2.x, _v2.y, _v2.z);
          data.push(_n2.x, _n2.y, _n2.z);
          data.push(_color.x, _color.y, _color.z);
          data.push(_v3.x, _v3.y, _v3.z);
          data.push(_n3.x, _n3.y, _n3.z);
          data.push(_color.x, _color.y, _color.z);
          debugWrapper.numTriData++;
        }
      };
    }

    /** The source code (string) of the in physicsDebug used very simple vertexShader.
     *  Handling the projection (which includes, view/world[is always identity in this case]/projection in Fudge). Increasing the size of single points drawn.
     *  And transfer position color to the fragmentShader. */
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

			void main() {
				vPosition = aPosition;
				vColor = aColor;
				vNormal = aNormal;
				gl_Position = u_projection * vec4(aPosition,1.0);
				gl_PointSize = 6.0;
			}`;
    }

    /** The source code (string) of the in physicsDebug used super simple fragmentShader. Unlit - only colorizing the drawn pixels, normals/position are given to make it expandable */
    private fragmentShaderSource(): string {
      return `
      precision mediump float;
			varying vec3 vPosition;
			varying vec3 vNormal;
			varying vec3 vColor;

			void main() {
				gl_FragColor = vec4(vColor, 1.0);
			}`;
    }
  }

}