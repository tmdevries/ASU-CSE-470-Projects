var canvas;
var gl;

var shaderProgram;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //  Configure WebGL
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor(0.09, 0.32, 0.55, 1.0);

    gl.enable(gl.DEPTH_TEST);

    //-------------------------------------------------
    //  Load shaders and initialize attribute buffers
    shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaderProgram );

    initAttributesAndUniforms();
    // TARA: I have created another file entitled meshData.js and included it in the html file.
    // meshData.js contains functions which will procedurally generate the mesh data for all of
    // my geometry
    generateGeometry();

    createGroundPlane();
    createNyanCat();

    initTextures(groundPlane);
    initTextures(nyanCat);

    render();
};

//-------------------------------------------------------------------------------------
function initAttributesAndUniforms() {
    // vertex attribute  
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );
     
    // texture attribute
    shaderProgram.textureAttribute = gl.getAttribLocation(shaderProgram, "aTexCoord");
    gl.enableVertexAttribArray(shaderProgram.textureAttribute);
    // texture uniforms
    shaderProgram.useTextureUniform = gl.getUniformLocation(shaderProgram, "uUseTextureImg");
    shaderProgram.textureImageUniform = gl.getUniformLocation(shaderProgram, "uTextureImg");
    shaderProgram.useRainbowUniform = gl.getUniformLocation(shaderProgram, "uRainbowEffect");
    shaderProgram.rainbowStepUniform = gl.getUniformLocation(shaderProgram, "uRainbowStep");

    // normal vector attribute
    shaderProgram.normalVectorAttribute = gl.getAttribLocation(shaderProgram, "aNormal");
    gl.enableVertexAttribArray(shaderProgram.normalVectorAttribute);

    // matrix uniforms
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "MVMatrix");
    shaderProgram.projectionMatrixUniform = gl.getUniformLocation(shaderProgram, "PMatrix");
    shaderProgram.normalMatrixUniform = gl.getUniformLocation(shaderProgram, "NMatrix");

    // light uniforms
    shaderProgram.cameraPositionUniform = gl.getUniformLocation(shaderProgram, "uCameraPosition");
    shaderProgram.lightPositionUniform = gl.getUniformLocation(shaderProgram, "uLightPosition");
    shaderProgram.diffuseColorUniform = gl.getUniformLocation(shaderProgram, "uDiffuseColor");
    shaderProgram.specularColorUniform = gl.getUniformLocation(shaderProgram, "uSpecularColor");
    shaderProgram.specularShininessUniform = gl.getUniformLocation(shaderProgram, "uShininess");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.colorUniform = gl.getUniformLocation(shaderProgram, "uColor");
}

//-------------------------------------------------------------------------------------
function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );
    
    animate();
    draw(nyanCat);
    draw(groundPlane);
    
    window.requestAnimFrame(render);
}

//-------------------------------------------------------------------------------------
// initTextures():
// Goes through and object and all its chidlren and prepares the images to be used as 
// textures
//-------------------------------------------------------------------------------------
function initTextures(object) {
    for (var i = 0; i < object.geometry.params.faces; i++) {
        if (object.useTexture[i]) {
            imgLoad(object, i);
        }
    }
    if(object.child !== null) {
        for(var j = 0; j < object.child.length; j++) {
            initTextures(object.child[j]);
        }
    }
}

//-------------------------------------------------------------------------------------
function imgLoad(object, index) {
    var imgPosition = object.textures.length; // do before so that when a new image is 
                                              // pushed the index is correct.
    object.textures.push(gl.createTexture());
    object.textures[imgPosition].image = new Image();
    object.textures[imgPosition].image.onload = function() {
        onImageLoad(object.textures[imgPosition]);
    };
    object.textures[imgPosition].image.src = object.textureImages[index];
}

//-------------------------------------------------------------------------------------
// onImageLoad():
// Set image properties for the shader. For the images that aren't square I use 
// clamping to color the rest of the pixels.
//-------------------------------------------------------------------------------------
function onImageLoad(texture) {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

//-------------------------------------------------------------------------------------
// handleKeyPress():
// Added to the body tag in the HTML file, this function handles the "onkeypress" event
//-------------------------------------------------------------------------------------
function handleKeyPress(event) {
    var x = event.which || event.keyCode;
    if (x == "38") {
        moveCamera(9/10);
    } else if (x == "40") {
        moveCamera(10/9);
    } else if (x == "37") {
        rotateCamera(-2);
    } else if (x == "39") {
        rotateCamera(2);
    }
}

//-------------------------------------------------------------------------------------
function moveCamera(scaleF) {
    lpParams.eye = scale(scaleF, lpParams.eye);
}

//-------------------------------------------------------------------------------------
function rotateCamera(angle) {
    lpParams.angle+=angle;
    var radius = Math.sqrt(Math.pow(lpParams.eye[0],2) + Math.pow(lpParams.eye[1], 2));
    lpParams.eye[0] = radius*Math.cos(lpParams.angle*Math.PI/180.0);
    lpParams.eye[1] = radius*Math.sin(lpParams.angle*Math.PI/180.0);
}
