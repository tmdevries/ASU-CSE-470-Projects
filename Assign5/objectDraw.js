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
        scaleFactorX: 0.7,
        scaleFactorY: 0.7,
        scaleFactorZ: 0.7,
        rotateTheta: 0.0,
        dX: 0.0,
        dY: 0.0,
        dZ: 0.0
    };

// Camera and Projection
var projection;
var lpParams = {
    step: 0, // TARA: for rotation
    stepMax: 10000,
    eye: vec3( 0.0 , 1.0 , 1.0 ), // TARA: position of the camera
    at: vec3( 0, 0, 0 ), // TARA: what point the camera is looking at
    up: vec3( 0, 0, 1 ), // TARA: Vector that tells the camera which way it's oriented. Eg. -1 for y makes the world look up-side down
    pMatrix: perspective( 45, 1.0, 0.1, 100 )
}; // TARA: This is the same for all geometries so that is why it is only defined once.

// Lighting
var lighting = {
    lightPosition: vec3( 0.0, 1.0, -0.2 ),
    ambientColor: vec3( 0.3, 0.3, 0.3 ),
    diffuseColor: vec3( 0.8, 0.8, 0.8 ),
    specularColor: vec3( 0.3, 0.3, 0.3 )
};


//-------------------------------------------------------------------------------------
function draw(object) {
    prepBuffer(object.geometry);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, object.geometry.params.itemSize, gl.FLOAT, false, 0, 0 );
    
    // TARA: Create the transformations for the modelView. I chose a position in which you can clearly
    // see the ground plane and cylinder. It is global so that I can easily change this value without
    // having to search through code
    modelView = mult(scalem(object.mvParams.scaleFactorX,object.mvParams.scaleFactorY,object.mvParams.scaleFactorZ), mat4());
    modelView = mult(rotate(object.mvParams.rotateX,[1,0,0]), modelView);
    modelView = mult(rotate(object.mvParams.rotateY,[0,1,0]), modelView);
    modelView = mult(rotate(object.mvParams.rotateZ,[0,0,1]), modelView);
    modelView = mult(translate(object.mvParams.dX,object.mvParams.dY,object.mvParams.dZ), modelView);

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(modelView));

    // TARA: Set up the transformation matrix for the normals. This ignores the translations (which potentially 
    // screws up the magnitude and direction of the normal, hence why I only care about scale (magnitude) and 
    // rotation (direction)). Will normal will be normalized again in fragment shader
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, flatten(normalMatrix(modelView, 1)));

    // TARA: Now, prepare the projection matrix
    rotateCamera();
    projection = mult(lpParams.pMatrix, lookAt(lpParams.eye, lpParams.at, lpParams.up)); // TARA: multiply look first
    gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, flatten(projection));

    // TARA: Pass in the lighting uniforms
    gl.uniform3fv(shaderProgram.cameraPositionUniform, flatten(lpParams.eye));
    gl.uniform3fv(shaderProgram.lightPositionUniform, flatten(lighting.lightPosition));
    gl.uniform3fv(shaderProgram.diffuseColorUniform, flatten(lighting.diffuseColor));
    gl.uniform3fv(shaderProgram.specularColorUniform, flatten(lighting.specularColor));
    gl.uniform3fv(shaderProgram.ambientColorUniform, flatten(lighting.ambientColor));
    gl.uniform1f(shaderProgram.specularShininessUniform, object.materialShininess);
    
    // TARA: Now it's time to load the texture coordinates. The itemSize of this is always 2.
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextCoordBuffer);
    gl.vertexAttribPointer( shaderProgram.textureAttribute, 2, gl.FLOAT, false, 0, 0 );

    gl.uniform4fv(shaderProgram.colorUniform, object.color);

    // TARA: Last, but not least, pass the normals into the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalVectorBuffer);
    gl.vertexAttribPointer( shaderProgram.normalVectorAttribute, 3, gl.FLOAT, false, 0, 0 );

    gl.drawArrays( object.geometry.params.drawMethod, 0, object.geometry.params.numItems );
    if(object.child !== null) {
        for(var i=0; i < object.child.length; i++) {
            draw(object.child[i]);
        }
    }
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