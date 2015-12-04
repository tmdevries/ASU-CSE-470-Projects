// Renderer Object
// canvas: 			Canvas Element
// height: 			Screen height
// width: 			Screen width
// iFocalLength:	FocalLength input element
// iNumberSteps: 	NumberSteps input element
// iEpsilon: 		Epsilon input element

function Renderer(canvas, height, width, iFocalLength, iEpsilon){
    // Init WebGL-Renderer
    this.canvas = canvas;
    this.height = height;
    this.width = width;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
	this.gl = this.canvas.getContext("experimental-webgl");
	if(!this.gl) this.gl = this.canvas.getContext("webgl");;
	if(!this.gl) {console.log("Error: Unable to initialise WebGL");return;}

	// Init GLSL Program
    var vertexShaderSource = this.getShaderSourceFromScript("vertexShader");
    var fragmentShaderSource = this.loadShaderSource("raytrace.glsl");

	var vertexShader = this.createShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    var fragmentShader = this.createShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
	this.program = this.createProgram(vertexShader, fragmentShader);
	this.gl.useProgram(this.program);

	// Create Quad
	this.createQuad();

	// Init Controls
	this.controls = new Controls(
		this.canvas,
		this.update.bind(this)
	);

	// Init Input Fields
	this.iFocalLength = iFocalLength;
    this.iFocalLength.min = 0.1;
    this.iFocalLength.max = 10;
    this.iFocalLength.step = 0.1;

    this.iEpsilon = iEpsilon;
    this.iEpsilon.min = 0.00001;
    this.iEpsilon.max = 0.01;
    this.iEpsilon.step = 0.00001;

    // Init Camera Paramters and render
    this.resetCameraParameters();
}

// Reset camera paramters to initial values
Renderer.prototype.resetCameraParameters = function(){
	this.iFocalLength.value = 2;	// Distance between the eye and the image plane
	this.iEpsilon.value = 0.0001; 	// Surface Threshold
	this.update();
}

// Update Screen
Renderer.prototype.update = function(){
	// Update Uniforms
	this.updateUniforms();

	// Render Scene
	this.render();
}

// Store current unfiforms in shader
Renderer.prototype.updateUniforms = function() {
	var camUp = this.controls.camUp;
	var camRight = this.controls.camRight;
	var camForward = this.controls.camForward;
	var eye = this.controls.eye;
	this.gl.uniform3f(this.program.uCameraUpLoc, camUp[0], camUp[1], camUp[2]);
	this.gl.uniform3f(this.program.uCameraRightLoc, camRight[0], camRight[1], camRight[2]);
	this.gl.uniform3f(this.program.uCameraForwardLoc, camForward[0], camForward[1], camForward[2]);
	this.gl.uniform3f(this.program.uCameraEyeLoc, eye[0], eye[1], eye[2]);
	this.gl.uniform1f(this.program.uCameraAspectRatioLoc, this.width/this.height);
	this.gl.uniform1f(this.program.uCameraFocalLengthLoc, this.iFocalLength.value);
	this.gl.uniform1f(this.program.uSettingsEpsilonLoc, this.iEpsilon.value);
	this.gl.uniform2f(this.program.uSettingsResolutionLoc, this.width, this.height);

    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uLights[0].position"), 1, 10, -1 );
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uLights[0].color"), 1, 1, 1 );
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uLights[1].position"), -10, 10, 10 );
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uLights[1].color"), 1, 1, 1 );

    //ruby
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[0].ambient"),0.1745,0.01175,0.01175);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[0].diffuse"),0.61424,0.04136,0.04136);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[0].specular"),0.727811,0.626959,0.626959);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[0].shininess"), 76.8);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[0].reflectivity"), 0.6);
    //gold
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[1].ambient"),0.24725,0.1995,0.0745);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[1].diffuse"),0.75164,0.60648,0.22648);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[1].specular"),0.628281,0.555802,0.366065);
	this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[1].shininess"), 51.2);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[1].reflectivity"), 0.4);
    //chrome
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[2].ambient"),0.25,0.25,0.25);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[2].diffuse"),0.4,0.4,0.4);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[2].specular"),0.774597,0.774597,0.774597);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[2].shininess"), 76.8);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[2].reflectivity"), 0.6);
    //pearl
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[3].ambient"),0.25,0.20725,0.20725);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[3].diffuse"),1.0,0.829,0.829);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[3].specular"),0.296648,0.296648,0.296648);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[3].shininess"), 11.3);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[3].reflectivity"), 0.1);
    //turquoise
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[4].ambient"),0.1,0.18725,0.1745);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[4].diffuse"),0.396,0.74151,0.69102);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[4].specular"),0.297254,0.30829,0.306678);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[4].shininess"), 12.8);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[4].reflectivity"), 0.3);
    //green rubber
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[5].ambient"),0.0,0.05,0.0);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[5].diffuse"),0.4,0.5,0.4);
    this.gl.uniform3f(this.gl.getUniformLocation(this.program,"uMaterialProperties[5].specular"),0.04,0.7,0.04);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[5].shininess"), 10.0);
    this.gl.uniform1f(this.gl.getUniformLocation(this.program,"uMaterialProperties[5].reflectivity"), 0.0);
}

// Renders the Scene
Renderer.prototype.render = function(){
	this.gl.clear(this.gl.COLOR_BUFFER_BIT);
	this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
}

// Update canvas size
Renderer.prototype.updateSize = function(height, width){
	this.height = height;
    this.width = width;
    this.canvas.height = this.height;
    this.canvas.width = this.width;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    this.update();
}

// Create Shader program
Renderer.prototype.createProgram = function(vertexShader, fragmentShader) {
	// Init Program
    var program = this.gl.createProgram();
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);

    // Check link status
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.log("Error: Unable to Link Shader", this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return null;
    }

    // Get Location of Uniforms
	program.uCameraUpLoc = this.gl.getUniformLocation(program, "uCamera.up");
	program.uCameraRightLoc = this.gl.getUniformLocation(program, "uCamera.right");
	program.uCameraForwardLoc = this.gl.getUniformLocation(program, "uCamera.forward");
	program.uCameraEyeLoc = this.gl.getUniformLocation(program, "uCamera.eye");
	program.uCameraAspectRatioLoc = this.gl.getUniformLocation(program, "uCamera.aspectRatio");
	program.uCameraFocalLengthLoc = this.gl.getUniformLocation(program, "uCamera.focalLength");

	program.uSettingsEpsilonLoc = this.gl.getUniformLocation(program, "uSettings.epsilon");
	program.uSettingsResolutionLoc = this.gl.getUniformLocation(program, "uSettings.resolution");

    return program;
}

Renderer.prototype.loadShaderSource = function(path) {

    var xhr = new XMLHttpRequest();
		xhr.overrideMimeType("x-shader/x-fragment");
    xhr.open( "get", path, false );
    xhr.send();

    var source = xhr.responseText;

    return source;
}


// Obtain the the source code of a shader from an element
Renderer.prototype.getShaderSourceFromScript = function(scriptId) {

    var shaderScript = document.getElementById(scriptId);
    if (!shaderScript){console.log("Error: Unable to load Shader-Script",scriptId);return;}

    return shaderScript.text;
}

// Create Shader
Renderer.prototype.createShader = function(shaderType,source) {

	// Create shader object
    var shader = this.gl.createShader(shaderType);

    // Load shader source
    this.gl.shaderSource(shader, source);

    // Compile shader
    this.gl.compileShader(shader);

    // Check compile status
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.log("Error: Shader does not compile",this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    return shader;
}

// Create view screen
Renderer.prototype.createQuad = function(){
	// get location of aVertexPosition
	var aVertexPositionLoc = this.gl.getAttribLocation(this.program, "aVertexPosition");

	// Create Quad
	var buffer = this.gl.createBuffer();
	this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
	this.gl.bufferData(
	    this.gl.ARRAY_BUFFER,
	    new Float32Array([
	        -1.0, -1.0, 0.0,
	        -1.0,  1.0, 0.0,
	         1.0, -1.0, 0.0,
	         1.0,  1.0, 0.0]),
	    this.gl.STATIC_DRAW
    );
    this.gl.enableVertexAttribArray(aVertexPositionLoc);
	this.gl.vertexAttribPointer(aVertexPositionLoc, 3, this.gl.FLOAT, false, 0, 0);
}