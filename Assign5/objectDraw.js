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
    step: 0, // TARA: for rotation
    stepMax: 10000,
    eye: vec3( 0.0 , -1.5 , 1.0 ), // TARA: position of the camera
    at: vec3( 0, 0, 0 ), // TARA: what point the camera is looking at
    up: vec3( 0, 0, 1 ), // TARA: Vector that tells the camera which way it's oriented. 
                         // Eg. -1 for y makes the world look up-side down
    pMatrix: perspective( 45, 1.0, 0.1, 100 )
}; // TARA: This is the same for all geometries so that is why it is only defined once.

//-------------------------------------------------------------------------------------
function draw(object) {
    prepBuffer(object.geometry);

    gl.bindBuffer(gl.ARRAY_BUFFER, triangleVertexPositionBuffer);
    gl.vertexAttribPointer( shaderProgram.vertexPositionAttribute, object.geometry.params.itemSize, gl.FLOAT, false, 0, 0 );
    
    // TARA: Create the transformations for the modelView. I chose a position in which you can clearly
    // see the ground plane and cylinder. It is global so that I can easily change this value without
    // having to search through code
    modelView = mult(scalem(object.mvParams.scaleFactor[0],object.mvParams.scaleFactor[1],object.mvParams.scaleFactor[2]), mat4());
    modelView = mult(rotate(object.mvParams.currentRotation[0],[1,0,0]), modelView);
    modelView = mult(rotate(object.mvParams.currentRotation[1],[0,1,0]), modelView);
    modelView = mult(rotate(object.mvParams.currentRotation[2],[0,0,1]), modelView);
    modelView = mult(translate(object.mvParams.currentTranslation[0],object.mvParams.currentTranslation[1],object.mvParams.currentTranslation[2]), modelView);

    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, flatten(modelView));

    // TARA: Set up the transformation matrix for the normals. This ignores the translations (which potentially 
    // screws up the magnitude and direction of the normal, hence why I only care about scale (magnitude) and 
    // rotation (direction)). Normal will be normalized again in fragment shader
    gl.uniformMatrix3fv(shaderProgram.normalMatrixUniform, false, flatten(normalMatrix(modelView, 1)));

    // TARA: Now, prepare the projection matrix
    rotateCamera();
    projection = mult(lpParams.pMatrix, lookAt(lpParams.eye, lpParams.at, lpParams.up)); // TARA: multiply look first
    gl.uniformMatrix4fv(shaderProgram.projectionMatrixUniform, false, flatten(projection));

    lightUpScene(object);
    
    // TARA: Now it's time to load the texture coordinates. The itemSize of this is always 2.
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleTextCoordBuffer);
    gl.vertexAttribPointer( shaderProgram.textureAttribute, 2, gl.FLOAT, false, 0, 0 );
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i( shaderProgram.textureImageUniform, 0 );

    gl.uniform4fv(shaderProgram.colorUniform, object.color);

    // TARA: Last, but not least, pass the normals into the shader
    gl.bindBuffer(gl.ARRAY_BUFFER, triangleNormalVectorBuffer);
    gl.vertexAttribPointer( shaderProgram.normalVectorAttribute, 3, gl.FLOAT, false, 0, 0 );

    drawFaces(object);
        
    if (object.child !== null) {
        for (var i = 0; i < object.child.length; i++) {
            draw(object.child[i]);
        }
    }
}

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

//-------------------------------------------------------------------------------------
function rotateCamera() {
    if (lpParams.step===lpParams.stepMax) {
        lpParams.step = 0;
    }
    var angle = (lpParams.step*2*Math.PI) / lpParams.stepMax;
    lpParams.eye[0] = 2*Math.cos(angle);
    lpParams.eye[1] = 2*Math.sin(angle);
    lpParams.step++;
}

//-------------------------------------------------------------------------------------
function animate() {
    // TARA: start by moving the individual parts of the nyan
    // cat: the head (w/ ears!), legs, and tail
    rotatePart(nyanCat.child[1], [-25,0,0], [25,0,0]); // first leg
    rotatePart(nyanCat.child[2], [-25,0,0], [25,0,0]); // second leg
    rotatePart(nyanCat.child[3], [-25,0,0], [25,0,0]); // third leg
    rotatePart(nyanCat.child[4], [-25,0,0], [25,0,0]); // fourth leg, all rotate forwards 
                                                       // and backwards
    rotatePart(nyanCat.child[5], [0,-20,0], [0,20,0]); // tail, swishes back and forth

    translatePart(nyanCat.child[0], [0,0,-0.2], [0,0,-0.15]); // bob head up and down

    translatePart(nyanCat, [-1,-1,0], [1,1,0]); // start with a circle path. Want to 
                                                // add jumping (dZ)

}

//-------------------------------------------------------------------------------------
function rotatePart(part, lowerLimit, upperLimit) {
    if (lowerLimit.length != 3 || upperLimit.length != 3) {
        console.log("This animation requires limits for all 3 angles even if just 0 degrees.");
        return;
    } // just in case I forget; it isn't safe to assume which axis to rotate around
    for (var i = 0; i < 3; i++) {
        if (part.animation.rotationAngle[i]+part.mvParams.currentRotation[i] < lowerLimit[i] ||
            part.animation.rotationAngle[i]+part.mvParams.currentRotation[i] > upperLimit[i]) {
            // reverse the rotation
            part.animation.rotationAngle[i] = -part.animation.rotationAngle[i];
        }
        rotatePartAndChildren(part, part.animation.rotationAngle[i], i);
    }
}

//-------------------------------------------------------------------------------------
function rotatePartAndChildren(part, angle, index) {
    part.mvParams.currentRotation[index]+=angle;
    if (part.child !== null) {
        for (var i = 0; i < part.child.length; i++) {
            rotatePartAndChildren(part.child[i], angle, index);
        }
    }
}

//-------------------------------------------------------------------------------------
function translatePart(part, lowerLimit, upperLimit) {
    if (lowerLimit.length != 3 || upperLimit.length != 3) {
        console.log("This animation requires limits for all 3 axes even if just 0 steps.");
        return;
    } // just in case I forget; it isn't safe to assume which axis to rotate around
    for (var i = 0; i < 3; i++) {
        if (part.animation.translationDelta[i]+part.mvParams.currentTranslation[i] < lowerLimit[i] ||
            part.animation.translationDelta[i]+part.mvParams.currentTranslation[i] > upperLimit[i]) {
            // reverse the translation
            part.animation.translationDelta[i] = -part.animation.translationDelta[i];
        }
        translatePartAndChildren(part, part.animation.translationDelta[i], i);
    }
}

//-------------------------------------------------------------------------------------
function translatePartAndChildren(part, delta, index) {
    part.mvParams.currentTranslation[index]+=delta;
    if (part.child !== null) {
        for (var i = 0; i < part.child.length; i++) {
            translatePartAndChildren(part.child[i], delta, index);
        }
    }
}