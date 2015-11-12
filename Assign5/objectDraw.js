//-------------------------------------------------------------------------------------
// objectDraw.js
// This file contains functions for drawing (generic) objects on the canvas.
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Global Variables
//-------------------------------------------------------------------------------------

// Buffers
var triangleVertexPositionBuffer;
var triangleTextCoordBuffer;
var triangleNormalVectorBuffer;

// Model-View
var modelView;
var mvParams = {
        scaleFactorX: 0.3,
        scaleFactorY: 0.3,
        scaleFactorZ: 0.5,
        rotateTheta: 0.0,
        dX: 0.0,
        dY: 0.0,
        dZ: 0.0
    };

// Camera and Projection
var projection;
var lpParams = {
    step: 0, // TARA: for rotation
    stepMax: 600,
    eye: vec3( 0.0 , -2.0 , 2.0 ), // TARA: position of the camera
    at: vec3( 0, 0, 0 ), // TARA: what point the camera is looking at
    up: vec3( 0, 0, 1 ), // TARA: Vector that tells the camera which way it's oriented. Eg. -1 for y makes the world look up-side down
    pMatrix: perspective( 45, 1.0, 0.1, 100 )
}; // TARA: This is the same for all geometries so that is why it is only defined once.

// Lighting
var lighting = {
    lightPosition: vec3( 10.0, 10.0, 10.0 ),
    ambientColor: vec3( 0.135, 0.2225, 0.1575 ),
    diffuseColor: vec3( 0.54, 0.89, 0.63 ),
    specularColor: vec3( 0.316228, 0.316228, 0.316228 )
};


//-------------------------------------------------------------------------------------
function draw(mesh) {
    prepBuffer(mesh);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, mesh.params.itemSize, gl.FLOAT, false, 0, 0 );
    
    // TARA: Create the transformations for the modelView. I chose a position in which you can clearly
    // see the ground plane and cylinder. It is global so that I can easily change this value without
    // having to search through code
    modelView = mult(scalem(mvParams.scaleFactorX,mvParams.scaleFactorY,mvParams.scaleFactorZ),mat4());
    modelView = mult(translate(mvParams.dX,mvParams.dY,mvParams.dZ), modelView);

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(modelView));

    // TARA: Set up the transformation matrix for the normals. This ignores the translations (which potentially 
    // screws up the magnitude and direction of the normal, hence why I only care about scale (magnitude) and 
    // rotation (direction)). Will normal will be normalized again in fragment shader
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, flatten(normalMatrix(modelView, 1)));

    // TARA: Now, prepare the projection matrix
    //rotateCamera();
    projection = mult(lpParams.pMatrix, lookAt(lpParams.eye, lpParams.at, lpParams.up)); // TARA: multiply look first
    gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, flatten(projection));

    // TARA: Pass in the lighting uniforms
    gl.uniform3fv(shaderProgram.cameraPositionUniform, flatten(lpParams.eye));
    gl.uniform3fv(shaderProgram.lightPositionUniform, flatten(lighting.lightPosition));
    gl.uniform3fv(shaderProgram.diffuseColorUniform, flatten(lighting.diffuseColor));
    gl.uniform3fv(shaderProgram.specularColorUniform, flatten(lighting.specularColor));
    gl.uniform3fv(shaderProgram.ambientColorUniform, flatten(lighting.ambientColor));
    gl.uniform1f(shaderProgram.specularShininessUniform, mesh.params.materialShininess);
    
    // TARA: Now it's time to load the texture coordinates. The itemSize of this is always 2.
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextCoordBuffer);
    gl.vertexAttribPointer( shaderProgram.textureAttribute, 2, gl.FLOAT, false, 0, 0 );

    // TARA: Last, but not least, pass the normals into the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalVectorBuffer);
    gl.vertexAttribPointer( shaderProgram.normalVectorAttribute, 3, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( mesh.params.drawMethod, 0, mesh.params.numItems );

}

//------------------------------------------------------------
function prepBuffer(mesh) {
    triangleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, triangleVertexPositionBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mesh.vertices), gl.STATIC_DRAW );

    triangleTextCoordBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, triangleTextCoordBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mesh.texCoords), gl.STATIC_DRAW );

    triangleNormalVectorBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, triangleNormalVectorBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(mesh.normals), gl.STATIC_DRAW );
}