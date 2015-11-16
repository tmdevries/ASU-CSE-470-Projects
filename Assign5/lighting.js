//-------------------------------------------------------------------------------------
// lighting.js
// This file contains the global variable and function associated with lighting.
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Global Variable
//-------------------------------------------------------------------------------------
var lighting = {
    lightPosition: vec3( 3.0, 0.0, 0.5 ),
    ambientColor: vec3( 0.3, 0.3, 0.3 ),
    diffuseColor: vec3( 0.8, 0.8, 0.8 ),
    specularColor: vec3( 0.3, 0.3, 0.3 )
};

//-------------------------------------------------------------------------------------
function lightUpScene(object){
	// TARA: Pass in the lighting uniforms
    gl.uniform3fv(shaderProgram.cameraPositionUniform, flatten(lpParams.eye));
    gl.uniform3fv(shaderProgram.lightPositionUniform, flatten(lighting.lightPosition));
    gl.uniform3fv(shaderProgram.diffuseColorUniform, flatten(lighting.diffuseColor));
    gl.uniform3fv(shaderProgram.specularColorUniform, flatten(lighting.specularColor));
    gl.uniform3fv(shaderProgram.ambientColorUniform, flatten(lighting.ambientColor));
    gl.uniform1f(shaderProgram.specularShininessUniform, object.materialShininess);
}