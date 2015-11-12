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
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //-------------------------------------------------
    //  Load shaders and initialize attribute buffers
    shaderProgram = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( shaderProgram );

    attributeBuffersInit();
    // TARA: I have created another file entitled meshData.js and included it in the html file.
    // meshData.js contains functions which will procedurally generate the mesh data for all of
    // my geometry
    generateGeometry();

    render();
};

//------------------------------------------------------------
function attributeBuffersInit() {
    // vertex attribute  
    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aPosition");
    gl.enableVertexAttribArray( shaderProgram.vertexPositionAttribute );
     
    // texture attribute
    shaderProgram.textureAttribute = gl.getAttribLocation(shaderProgram, "aTexCoord");
    gl.enableVertexAttribArray(shaderProgram.textureAttribute);

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
}

//------------------------------------------------------------
function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );

    //draw(cylinderMesh, cylinderMeshParams);
    draw(squarePyramidMesh);
    //animate(nyanCat);
    //draw(nyanCat);
    //draw(groundPlane);
    
    window.requestAnimFrame(render);
}

//------------------------------------------------------------
function rotateCamera() {
    if (lpParams.step===lpParams.stepMax) {
        lpParams.step = 0;
    }
    var angle = (lpParams.step*2*Math.PI) / lpParams.stepMax;
    lpParams.eye[0] = 2*Math.cos(angle);
    lpParams.eye[1] = 2*Math.sin(angle);
    lpParams.step++;
}