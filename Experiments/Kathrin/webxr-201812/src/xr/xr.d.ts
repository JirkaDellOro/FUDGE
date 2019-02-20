declare function require(path: string): any;

declare interface Navigator {
	xr;
}

declare interface XRDevice {
	requestSession(options: object): Promise<any>;
}

declare interface XRPresentationFrame {
	views: Array<XRView>;
	session: XRSession;

	getInputPose(inputSource: XRInputSource, frameOfRef: XRCoordinateSystem | XRFrameOfReference): any;
	getDevicePose(frameOfRef: XRCoordinateSystem | XRFrameOfReference): XRDevicePose;
}

declare interface XRFrame {
	views: Array<XRView>;
	session: XRSession;

	getInputPose(inputSource: XRInputSource, frameOfRef: XRCoordinateSystem | XRFrameOfReference): any;
	getDevicePose(frameOfRef: XRCoordinateSystem | XRFrameOfReference): XRDevicePose;
}

declare interface XRInputSource {}
declare interface XRInputSourceEvent {
	frame: XRFrame;
	inputSource: XRInputSource;
}

declare interface XRCoordinateSystem {
	getTransformTo(other: XRCoordinateSystem): Float32Array;
}

declare interface XRDevicePose {
	poseModelMatrix: Float32Array;
	getViewMatrix(view: XRView): Float32Array;
}

declare interface XRHitResult {
	hitMatrix: Float32Array;
}

declare interface XRView {
	eye: XREye;
	projectionMatrix: Float32Array;
}

declare enum XREye {
	"left",
	"right"
}

declare enum XREnvironmentBlendMode {
	"opaque",
	"additive",
	"alpha-blend"
}

declare interface XRPresentationContext {
	canvas: HTMLCanvasElement;
}

declare var XRSession;
declare interface XRSession {
	baseLayer: XRWebGLLayer;
	depthFar: number;
	depthNews: number;
	device: XRDevice;
	environmentBlendMode: XREnvironmentBlendMode;
	immersive: boolean;
	outputContext: XRPresentationContext;

	getInputSource();
	requestFrameOfReference(type: XRFrameOfReferenceType | string): Promise<XRFrameOfReference>;
	requestAnimationFrame(requestAnimationCallback): any;
	requestHitTest(origin: Float32Array, direction: Float32Array, frameOfRef: XRFrameOfReference): any;
	end(): Promise<void>;

	addEventListener(eventType, callback);
	dispatchEvent();
	removeEventListener();
}

declare function requestAnimationCallback(time, frame): any;

declare var XRFrameOfReference;
declare interface XRFrameOfReference {}

declare enum XRFrameOfReferenceType {
	"head-model",
	"eye-level",
	"stage"
}

declare interface WebGLRenderingContext {
	setCompatibleXRDevice(any): XRDevice;
}

declare var XRWebGLLayer;
declare interface XRWebGLLayer {
	context: WebGL2RenderingContext | WebGLRenderingContext;

	antialias: boolean;
	depth: boolean;
	stencil: boolean;
	alpha: boolean;

	framebuffer: WebGLFramebuffer;
	framebufferWidth: number;
	framebufferHeight: number;

	constructor(session: XRSession, context: WebGLRenderingContext, layerInit?: XRWebGLLayerInit);

	getViewport(view: XRView): XRViewport;
	requestViewportScaling(viewportScaleFactor: number): void;

	getNativeFramebufferScaleFactor(session: XRSession): number;
}

declare interface XRWebGLLayerInit {
	antialias: boolean;
	depth: boolean;
	stencil: boolean;
	alpha: boolean;
	framebufferScaleFactor: number;
}

declare interface XRViewport {
	x: number;
	y: number;
	width: number;
	height: number;
}
