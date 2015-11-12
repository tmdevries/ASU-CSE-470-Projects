//-------------------------------------------------------------------------------------
// meshData.js
// This file contains functions for producing the vertex positions, texture 
// coordinates, and vertex normals for a cylinder and a square pyramid. The global 
// variables for the meshes are cylinderMesh, cubeMesh, and squareMesh. (Note that a 
// cube is just a cylinder with a sample of 4). 
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Globals
//-------------------------------------------------------------------------------------
var cylinderMesh;
var cubeMesh;
var squarePyramidMesh;
var groundPlaneMesh;

//-------------------------------------------------------------------------------------
function generateGeometry() {
    
    cylinderMesh = generateCylinderGeometry(30); // pass in sample
    cylinderMesh.params = {
        materialShininess: 12.8,
        itemSize: 3,
        numItems: 360,
        drawMethod: gl.TRIANGLES
    };

    cubeMesh = generateCylinderGeometry(4);
    cubeMesh.params = {
		materialShininess: 12.8,
		itemSize: 3,
		numItems: 48,
		drawMethod: gl.TRIANGLES
    };

    squarePyramidMesh = generateSquarePyramidGeometry();
    squarePyramidMesh.params = {
        materialShininess: 12.8,
        itemSize: 3,
        numItems: 24,
        drawMethod: gl.TRIANGLES
    };

    groundPlaneMesh = generateGroundPlaneGeometry(10, 10, true);
    groundPlaneMesh.params = {
		materialShininess: 2.0,
		itemSize: 3,
		numItems: 600,
		drawMethod: gl.TRIANGLES
    };
}

//-------------------------------------------------------------------------------------
// generateCylinderGeometry()
// radius = 1, height = 1
// The purpose of altering this method from the previous assignment is to be
// able to use matrices to alter the look of a cylinder rather than redefine 
// the geometry every time. This way, only one cylinder is passed to the graphics
// card but it can be used multiple times with transformation matrices
//-------------------------------------------------------------------------------------
function generateCylinderGeometry(sample) {
	var cylinderMesh={vertices:[],texCoords:[],normals:[]};
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

//-------------------------------------------------------------------------------------
function generateSquarePyramidGeometry() {
	var squarePyramidMesh={vertices:[],texCoords:[],normals:[]};
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

//-------------------------------------------------------------------------------------
function generateGroundPlaneGeometry(width, height, uniform) {
	// TARA: Procedurally generating the vertex coordinates of the ground mesh...
	// I am building a mesh of triangles in which the x coordinates vary from
	// [-1,1] and the y coordinates vary from [-1,1], with a step of 2/width and 2/height, 
	// respectively. 
	var groundMesh={vertices:[],texCoords:[],normals:[]};
	var i,j;
	var positions=[];
	for(j = -1; j <= 1; j+=(2/height)){
		for(i = -1; i <= 1; i+=(2/width)){
			positions.push(vec3(i,j,0));
		}
	}
	// TARA: There will be a total of (width+1)*(height+1) vertices. 
	// Vary i here from 0 to (width+1)*height because each vertex in the final column is 
	// skipped and it must iterate width*height times.
	var rowSkip = width;
	var iterations = (width+1)*height; // So it's only computed once
	for(i = 0; i < iterations; i++){
		if (i==rowSkip) {
			rowSkip+=(width+1);
			continue;
		}
		groundMesh.vertices.push(positions[i]);
		groundMesh.vertices.push(positions[i+1]);
		groundMesh.vertices.push(positions[i+4+1]);
		groundMesh.vertices.push(positions[i+1]);
		groundMesh.vertices.push(positions[i+4+2]);
		groundMesh.vertices.push(positions[i+4+1]);
	}
	// TARA: there are a total of 2*width*height triangles, with 3 vertices each,
	// each needing a set of texture coordinates, thus 6*widht*height texture coords.
	// Texture coordinates will depend of whether the texture is uniform or "patterned"
	// (i.e. each square in the plane gets its own texture)
	if (uniform) {
		for(j = 0; j <= 1; j+=(1/height)){
			for(i = 0; i <= 1; i+=(1/width)){
				groundMesh.texCoords.push(vec2(i,j));
			}
		}
	} else {
		iterations = width*height;
		for (i = 0; i < iterations; i++) {
			groundMesh.texCoords.push(vec2(0,0));
			groundMesh.texCoords.push(vec2(1,0));
			groundMesh.texCoords.push(vec2(0,1));
			groundMesh.texCoords.push(vec2(1,0));
			groundMesh.texCoords.push(vec2(1,1));
			groundMesh.texCoords.push(vec2(0,1));
		}
	}

	// TARA: Finally, the normal vectors, which just always point "up."
	iterations*=6; // there are 6*width*height vertices
	for (i = 0; i < iterations; i++) {
		groundMesh.normals.push(vec3(0,0,1));
	}

    return groundMesh;
}