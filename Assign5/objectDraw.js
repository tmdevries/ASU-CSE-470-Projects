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

// Camera and Projection
var projection;

var lpParams = {
    angle: 0, // TARA: for rotating the camera
    eye: vec3( 5.0 , 0.0 , 2.0 ), // TARA: position of the camera
    at: vec3( 0, 0, 0 ), // TARA: what point the camera is looking at
    up: vec3( 0, 0, 1 ), // TARA: Vector that tells the camera which way it's oriented. 
                         // Eg. -1 for y makes the world look up-side down
    pMatrix: perspective( 45, 1.0, 0.1, 100 )
}; // TARA: This is the same for all geometries so that is why it is only defined once.

// used for shifting the rainbow, making it look animated
var rainbowStep = { step: Math.PI/12, now: 0.0};

//-------------------------------------------------------------------------------------
function draw(object) {
    prepBuffer(object.geometry);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, object.geometry.params.itemSize, gl.FLOAT, false, 0, 0);
    
    // TARA: Create the transformations for the modelView. I chose a position in which you can clearly
    // see the ground plane and cylinder. It is global so that I can easily change this value without
    // having to search through code
    modelView = mult(scalem(object.mvParams.scaleFactor[0],object.mvParams.scaleFactor[1],object.mvParams.scaleFactor[2]), mat4());
    modelView = mult(rotate(object.mvParams.currentRotation[0],[1,0,0]), modelView);
    modelView = mult(rotate(object.mvParams.currentRotation[1],[0,1,0]), modelView);
    modelView = mult(translate(object.mvParams.currentTranslation[0],object.mvParams.currentTranslation[1],object.mvParams.currentTranslation[2]), modelView);
    // TARA: rotation about z multiplied last because multiplying it before moving the parts via translation
    // makes the parts end up in different places, not all together. Also allows my character to move in
    // a circle without defining a specific path. I just increase the z rotation angle at each render.
    modelView = mult(rotate(object.mvParams.currentRotation[2],[0,0,1]), modelView);

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(modelView));

    // TARA: Set up the transformation matrix for the normals. This ignores the translations (which potentially 
    // screws up the magnitude and direction of the normal, hence why I only care about scale (magnitude) and 
    // rotation (direction)). Normal will be normalized again in fragment shader
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, flatten(normalMatrix(modelView, 1)));

    // TARA: Now, prepare the projection matrix
    projection = mult(lpParams.pMatrix, lookAt(lpParams.eye, lpParams.at, lpParams.up)); // TARA: multiply look first
    gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, flatten(projection));

    lightUpScene(object);
    
    // TARA: Now it's time to load the texture coordinates. The itemSize of this is always 2.
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureAttribute, 2, gl.FLOAT, false, 0, 0);
    gl.activeTexture( gl.TEXTURE0 );
    gl.uniform1i(shaderProgram.textureImageUniform, 0);

    gl.uniform4fv(shaderProgram.colorUniform, object.color);

    // TARA: Last, but not least, pass the normals into the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalVectorBuffer);
    gl.vertexAttribPointer(shaderProgram.normalVectorAttribute, 3, gl.FLOAT, false, 0, 0);

    if (object.geometry==uniformGroundPlaneMesh) {
        gl.uniform1i(shaderProgram.useRainbowUniform, 1);
        gl.uniform1f(shaderProgram.rainbowStepUniform, rainbowStep.now);
        rainbowStep.now+=rainbowStep.step;
    } else {
        gl.uniform1i(shaderProgram.useRainbowUniform, 0);
    }
    drawFaces(object);
        
    if (object.child !== null) {
        for (var i = 0; i < object.child.length; i++) {
            draw(object.child[i]);
        }
    }
}

//-------------------------------------------------------------------------------------
// drawFaces():
// This calls the correct draw function based on the number of faces the object has. 
// Allows me to specify a special texture for a specific face of the object.
//-------------------------------------------------------------------------------------
function drawFaces(object) {
    switch (object.geometry.params.faces) {
        case 1:
            drawPlane(object);
            break;
        case 3:
            drawCylinder(object);
            break;
        case 5:
            drawSquarePyramid(object);
            break;
        case 6:
            drawCube(object);
            break;
        default:
            // Only handling the specific geometries that I have set up so far. 
            // Theoreticlally this default will never occur in this program but I 
            // wanted to abstract the design a bit.
            console.log("Texture images for this number of faces is currently not supported.");
            gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( object.geometry.params.drawMethod, 0, object.geometry.params.numItems );
            break;
    }
}
//-------------------------------------------------------------------------------------
function drawPlane(plane) {
    if (plane.useTexture[0]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1); // let the shader know to use 
                                                          // a texture instead
        gl.bindTexture(gl.TEXTURE_2D, plane.textures[0]);
        gl.drawArrays( plane.geometry.params.drawMethod, 0, plane.geometry.params.numItems );
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
        gl.drawArrays( plane.geometry.params.drawMethod, 0, plane.geometry.params.numItems );
    }
}

//-------------------------------------------------------------------------------------
function drawCylinder(cylinder) {
    var textureIndex = 0;
    var iterations = cylinder.geometry.params.numItems / 12; // tells me what the sample was
    // Iterate sliver by sliver; there are 12 vertices defined per sliver
    for (var i = 0; i < iterations; i++) {
        // Bottom circle wedge
        if (cylinder.useTexture[0]) {
            gl.uniform1i(shaderProgram.useTextureUniform, 1);
            gl.bindTexture(gl.TEXTURE_2D, cylinder.textures[textureIndex]);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12, 3 );
            textureIndex++;
        } else {
            gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12, 3 );
        }
        // Top circle wedge
        if (cylinder.useTexture[1]) {
            gl.uniform1i(shaderProgram.useTextureUniform, 1);
            gl.bindTexture(gl.TEXTURE_2D, cylinder.textures[textureIndex]);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12+3, 3 );
            textureIndex++;
        } else {
            gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12+3, 3 );
        }
        // Panel
        if (cylinder.useTexture[2]) {
            gl.uniform1i(shaderProgram.useTextureUniform, 1);
            gl.bindTexture(gl.TEXTURE_2D, cylinder.textures[textureIndex]);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12+6, 6 );
            textureIndex++;
        } else {
            gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( cylinder.geometry.params.drawMethod, i*12+6, 6 );
        }
        textureIndex = 0; // reset before doing the loop again
    }
}

//-------------------------------------------------------------------------------------
function drawSquarePyramid(squarePyramid) {
    var textureIndex = 0;
    // Base
    if (squarePyramid.useTexture[0]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1);
        gl.bindTexture(gl.TEXTURE_2D, squarePyramid.textures[textureIndex]);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 0, 6 );
        textureIndex++;
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 0, 6 );
    }
    // Left
    if (squarePyramid.useTexture[1]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1);
        gl.bindTexture(gl.TEXTURE_2D, squarePyramid.textures[textureIndex]);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 6, 6 );
        textureIndex++;
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 6, 6 );
    }
    // Right
    if (squarePyramid.useTexture[2]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1);
        gl.bindTexture(gl.TEXTURE_2D, squarePyramid.textures[textureIndex]);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 12, 6 );
        textureIndex++;
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 12, 6 );
    }
    // Back
    if (squarePyramid.useTexture[3]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1);
        gl.bindTexture(gl.TEXTURE_2D, squarePyramid.textures[textureIndex]);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 18, 3 );
        textureIndex++;
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 18, 3 );
    }
    // Front
    if (squarePyramid.useTexture[4]) {
        gl.uniform1i(shaderProgram.useTextureUniform, 1);
        gl.bindTexture(gl.TEXTURE_2D, squarePyramid.textures[textureIndex]);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 21, 3 );
    } else {
        gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( squarePyramid.geometry.params.drawMethod, 21, 3 );
    }
}

//-------------------------------------------------------------------------------------
function drawCube(cube) {
    var textureIndex = 0;
    // Iterate face by face; there are 6 vertices defined per face
    for (var i = 0; i < 6; i++) {
        // Face
        if (cube.useTexture[i]) {
            gl.uniform1i(shaderProgram.useTextureUniform, 1);
            gl.bindTexture(gl.TEXTURE_2D, cube.textures[textureIndex]);
            gl.drawArrays( cube.geometry.params.drawMethod, i*6, 6 );
            textureIndex++;
        } else {
            gl.uniform1i(shaderProgram.useTextureUniform, 0);
            gl.drawArrays( cube.geometry.params.drawMethod, i*6, 6 );
        }
        textureIndex = 0; // reset before doing the loop again
    }
}

//-------------------------------------------------------------------------------------
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
