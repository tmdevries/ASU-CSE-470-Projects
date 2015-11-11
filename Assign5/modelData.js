
//-------------------------------------------------------------------------------------
// TARA: radius = 1, height = 1
// The purpose of altering this method from the previous assignment is to be
// able to use matrices to alter the look of a cylinder rather than redefine 
// the geometry every time. This way, only one cylinder is passed to the graphics
// card but it can be used multiple times with transformation matrices
//-------------------------------------------------------------------------------------
function generateCylinderGeometry(sample) {
	var cylinderMesh={vertices:[],texCoords:[], normals:[]};
	var i;
	for (i = 0; i < sample; i++) {
		// TARA: setup the angles (in radians) to be used (I need two of them per sliver 
		// of the cylinder)
		var angle_1 = (i*2*Math.PI) / sample;
		var angle_2 = ((i+1)*2*Math.PI) / sample;

		// TARA: bottom circle wedge data
		cylinderMesh.vertices.push(vec3(0,0,0)); // center of bottom circle
		cylinderMesh.vertices.push(vec3(Math.cos(angle_1), Math.sin(angle_1), 0));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_2), Math.sin(angle_2), 0));
		// TARA: texture explanation--with radius=1, diameter=2; however the texture coordinates
		// vary from 0,0 to 1,1. So, first the coordinates of the original x and y of the geometry 
		// are translated +1 to get them to be completely positive, ranging from ~0,0 to ~2,2 instead 
		// of ~-1,-1 to ~1,1. Then, they are divided by 2. E.g. this means that the center (once at 0,0) 
		// goes from 0,0 to 1,1 and then to 0.5,0.5.
		cylinderMesh.texCoords.push(vec2(0.5,0.5));
		cylinderMesh.texCoords.push(vec2((Math.cos(angle_1)+1.0)/2.0, (Math.sin(angle_1)+1.0)/2.0));
		cylinderMesh.texCoords.push(vec2((Math.cos(angle_2)+1.0)/2.0, (Math.sin(angle_2)+1.0)/2.0));
		// TARA: Now for the normals, which will be straight out in the z direction 
		cylinderMesh.normals.push(vec3(0,0,-1)); // "down" direction
		cylinderMesh.normals.push(vec3(0,0,-1));
		cylinderMesh.normals.push(vec3(0,0,-1));

		// TARA: top circle wedge data
		cylinderMesh.vertices.push(vec3(0,0,1)); // center of top circle
		cylinderMesh.vertices.push(vec3(Math.cos(angle_1), Math.sin(angle_1), 1));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_2), Math.sin(angle_2), 1));
		// Texture coordinates are the same as bottom circle wedge
		cylinderMesh.texCoords.push(vec2(0.5,0.5));
		cylinderMesh.texCoords.push(vec2((Math.cos(angle_1)+1.0)/2.0, (Math.sin(angle_1)+1.0)/2.0));
		cylinderMesh.texCoords.push(vec2((Math.cos(angle_2)+1.0)/2.0, (Math.sin(angle_2)+1.0)/2.0));
		// Normals
		cylinderMesh.normals.push(vec3(0,0,2)); // "up" direction
		cylinderMesh.normals.push(vec3(0,0,2));
		cylinderMesh.normals.push(vec3(0,0,2));

		// TARA: panel data
		// Starting with vertices... one triangle
		cylinderMesh.vertices.push(vec3(Math.cos(angle_1), Math.sin(angle_1), 1));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_1), Math.sin(angle_1), 0));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_2), Math.sin(angle_2), 1));
		// Second triangle
		cylinderMesh.vertices.push(vec3(Math.cos(angle_2), Math.sin(angle_2), 1));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_1), Math.sin(angle_1), 0));
		cylinderMesh.vertices.push(vec3(Math.cos(angle_2), Math.sin(angle_2), 0));
		// Texture coordinates for panel
		cylinderMesh.texCoords.push(vec2(i/sample,1));
		cylinderMesh.texCoords.push(vec2(i/sample,0));
		cylinderMesh.texCoords.push(vec2((i+1)/sample,1));
		cylinderMesh.texCoords.push(vec2((i+1)/sample,1));
		cylinderMesh.texCoords.push(vec2(i/sample,0));
		cylinderMesh.texCoords.push(vec2((i+1)/sample,0));
		// Normals
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_1), Math.sin(angle_1), 1), vec3(0,0,1)));
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_1), Math.sin(angle_1), 0), vec3(0,0,0)));
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_2), Math.sin(angle_2), 1), vec3(0,0,1)));
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_2), Math.sin(angle_2), 1), vec3(0,0,1)));
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_1), Math.sin(angle_1), 0), vec3(0,0,0)));
		cylinderMesh.normals.push(subtract(vec3(Math.cos(angle_2), Math.sin(angle_2), 0), vec3(0,0,0)));
		
    }
    return cylinderMesh;
}

function generateSquarePyramidGeometry() {
	var squarePyramidMesh={vertices:[],texCoords:[], normals:[]};
	// TARA: start with the vertex positions. I'm not sure how to define them procedurally, so I'm doing
	// it explicitly
	squarePyramidMesh.vertices = [
		// Base
		vec3( -1, -1, 0),
		vec3( -1,  1, 0),
		vec3(  1, -1, 0),
		vec3( -1,  1, 0),
		vec3(  1, -1, 0),
		vec3(  1,  1, 0),
		// "Left" panel
		vec3( -1, -1, 0),
		vec3( -1,  1, 0),
		vec3(  0,  1, 1),
		vec3( -1, -1, 0),
		vec3(  0,  1, 1),
		vec3(  0, -1, 1),
		// "Right" panel
		vec3(  1, -1, 0),
		vec3(  1,  1, 0),
		vec3(  0, -1, 1),
		vec3(  1,  1, 0),
		vec3(  0, -1, 1),
		vec3(  0,  1, 1),
		// "Back" face
		vec3( -1,  1, 0),
		vec3(  1,  1, 0),
		vec3(  0,  1, 1),
		// "Front" face
		vec3(  1, -1, 0),
		vec3( -1, -1, 0),
		vec3(  0, -1, 1)
	];

	squarePyramidMesh.texCoords = [
		// Base
		vec2(0,0),
		vec2(0,1),
		vec2(1,0),
		vec2(0,1),
		vec2(1,0),
		vec2(1,1),
		// "Left" panel
		vec2(0,0),
		vec2(0,1),
		vec2(1,0),
		vec2(0,1),
		vec2(1,0),
		vec2(1,1),
		// "Right" panel
		vec2(0,0),
		vec2(0,1),
		vec2(1,0),
		vec2(0,1),
		vec2(1,0),
		vec2(1,1),
		// "Back" face
		vec2(0,0),
		vec2(1,0),
		vec2(0.5,1),
		// "Front" face
		vec2(0,0),
		vec2(1,0),
		vec2(0.5,1)
	];

	squarePyramidMesh.normals = [
		// Base
		vec3(0,0,-1),
		vec3(0,0,-1),
		vec3(0,0,-1),
		vec3(0,0,-1),
		vec3(0,0,-1),
		vec3(0,0,-1),
		// "Left" panel
		vec3(-1,0,0),
		vec3(-1,0,0),
		vec3(-1,0,0),
		vec3(-1,0,0),
		vec3(-1,0,0),
		vec3(-1,0,0),
		// "Right" panel
		vec3(1,0,0),
		vec3(1,0,0),
		vec3(1,0,0),
		vec3(1,0,0),
		vec3(1,0,0),
		vec3(1,0,0),
		// "Back" face
		vec3(0,-1,0),
		vec3(0,-1,0),
		vec3(0,-1,0),
		// "Front" face
		vec3(0,1,0),
		vec3(0,1,0),
		vec3(0,1,0),
	];

	return squarePyramidMesh;
}