(function (lib, img, cjs, ss) {

var p; // shortcut to reference prototypes
lib.webFontTxtFilters = {}; 

// library properties:
lib.properties = {
	width: 550,
	height: 400,
	fps: 24,
	color: "#666666",
	opacity: 1.00,
	webfonts: {},
	manifest: []
};



lib.ssMetadata = [];


lib.webfontAvailable = function(family) { 
	lib.properties.webfonts[family] = true;
	var txtFilters = lib.webFontTxtFilters && lib.webFontTxtFilters[family] || [];
	for(var f = 0; f < txtFilters.length; ++f) {
		txtFilters[f].updateCache();
	}
};
// symbols:



(lib.Ship = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Ebene 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(1,1,1).p("AjbkeIBklrIB3AAIB4AAIBkFrgApnH0IAABkIhWAAIAApOIBWAAIAACqgADcH0IAACWIm3AAIAAiWImMAAAjbC0IAAFAApnC0IGMAAIAAnSAJoH0IAABkIBWAAIAApOIhWAAIAACqAJoH0ImMAAIm3AAADcC0IAAFAADcC0IGMAAIAAFAADcC0IAAnS");

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#000000").s().p("AjaKJIAAiVIG1AAIAACVgAJoJYIAAhkIAAlAIAAirIBWAAIAAJPgAq9JYIAApPIBWAAIAACrIGNAAIAAFAImNAAIAAlAIAAFAIAABkgADbH0IAAlAIGNAAIAAFAgAjaH0IAAlAIAAnSIG1AAIAAHSIAAFAgAjaH0gAjaC0gADbkegAjakeIBklqIB2AAIB3AAIBkFqg");

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

	// Ebene 2
	this.shape_2 = new cjs.Shape();
	this.shape_2.graphics.f("rgba(255,0,0,0.498)").s().p("AoQIRQjajbAAk2QAAk1DajbQDbjaE1AAQE2AADbDaQDaDbAAE1QAAE2jaDbQjbDak2AAQk1AAjbjag");

	this.timeline.addTween(cjs.Tween.get(this.shape_2).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-74.8,-74.8,149.6,149.6);


(lib.Segment = function(mode,startPosition,loop) {
	this.initialize(mode,startPosition,loop,{});

	// Ebene 1
	this.shape = new cjs.Shape();
	this.shape.graphics.f().s("#FFFFFF").ss(1,1,1).p("Al+JqQAAm6EXkVQEVkXG6AAQADAAACAAIAAjtQgEAAgDAAQkGAAjcBTQjjBYixCxQixCxhYDkQhTDbAAEHg");
	this.shape.setTransform(49.4,-62.3);

	this.shape_1 = new cjs.Shape();
	this.shape_1.graphics.f("#000000").s().p("ApsJqQAAkHBTjbQBYjkCxixQCxixDjhYQDchTEGAAIAHAAIAADtIgFAAQm6AAkVEXQkXEVAAG6g");
	this.shape_1.setTransform(49.4,-62.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.shape_1},{t:this.shape}]}).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(-13.8,-125.1,126.4,125.8);


// stage content:
(lib.Test1 = function(mode,startPosition,loop) {
if (loop == null) { loop = false; }	this.initialize(mode,startPosition,loop,{});

	// timeline functions:
	this.frame_0 = function() {
		this.gotoAndStop(2);
	}

	// actions tween:
	this.timeline.addTween(cjs.Tween.get(this).call(this.frame_0).wait(2));

	// Ebene 2
	this.text = new cjs.Text("X-Wing", "30px 'Impact'");
	this.text.lineHeight = 39;
	this.text.lineWidth = 91;
	this.text.setTransform(275.4,216.2);
	this.text._off = true;

	this.timeline.addTween(cjs.Tween.get(this.text).wait(1).to({_off:false},0).wait(1));

	// Ebene 1
	this.instance = new lib.Ship();
	this.instance.setTransform(157,187.4);

	this.instance_1 = new lib.Segment();
	this.instance_1.setTransform(413.9,169.2,1,1,0,0,0,49.4,-62.3);

	this.timeline.addTween(cjs.Tween.get({}).to({state:[{t:this.instance_1},{t:this.instance}]}).to({state:[]},1).wait(1));

}).prototype = p = new cjs.MovieClip();
p.nominalBounds = new cjs.Rectangle(357.2,306.9,394.4,155.3);

})(lib = lib||{}, images = images||{}, createjs = createjs||{}, ss = ss||{});
var lib, images, createjs, ss;