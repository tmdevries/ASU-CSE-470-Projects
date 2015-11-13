//-------------------------------------------------------------------------------------
// modelData.js
// This file contains global variables and functions for setting up the Nyan Cat model,
// such as the hierarchical structure, the transformation matrices, colors, textures,
// etc.
// Currently only supporting one color per unique object for this project but it will 
// be easy to use multiple colors by just doing something like what I did for textures.
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Global Variables
//-------------------------------------------------------------------------------------
var nyanCat;

var groundPlane;

//-------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------
function createNyanCat() {
	nyanCat = {
		child: [],
		geometry: cubeMesh,
		useTexture: [false, false, false, false, true, false],
		textureImages: [null, null, null, null, "poptart.png", null],
		textures: [],
		color: vec4(0.98, 0.8, 0.62, 1.0),
		materialShininess: 12.8,
		mvParams: {
			scaleFactorX: 0.05,
			scaleFactorY: 0.5,
			scaleFactorZ: 0.35,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.0,
			dY: 0.0,
			dZ: 0.0
		}
	};
	// Nyan Cat's Head
	nyanCat.child.push({
		child: [],
		geometry: cylinderMesh,
		useTexture: [true, false, false],
		textureImages: ["face.png", null, null],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.3,
			scaleFactorY: 0.25,
			scaleFactorZ: 0.1,
			rotateX: 90,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.0,
			dY: 0.6,
			dZ: -0.15
		},
	});
	
	// 2 Ears
	nyanCat.child[0].child.push({
		child: null,
		geometry: squarePyramidMesh,
		useTexture: [false, false, false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.17,
			scaleFactorY: 0.25,
			scaleFactorZ: 0.05,
			rotateX: 90,
			rotateY: 44,
			rotateZ: 0,
			dX: 0.15,
			dY: 0.55,
			dZ: -0.05
		},
	});
	
	nyanCat.child[0].child.push({
		child: null,
		geometry: squarePyramidMesh,
		useTexture: [false, false, false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.17,
			scaleFactorY: 0.25,
			scaleFactorZ: 0.05,
			rotateX: 90,
			rotateY: -44,
			rotateZ: 0,
			dX: -0.15,
			dY: 0.55,
			dZ: -0.05
		},
	});

	// 4 Legs
	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.07,
			scaleFactorY: 0.07,
			scaleFactorZ: 0.25,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.118,
			dY: 0.35,
			dZ: -0.5
		},
	});

	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.07,
			scaleFactorY: 0.07,
			scaleFactorZ: 0.25,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: -0.118,
			dY: 0.35,
			dZ: -0.5
		},
	});

	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.07,
			scaleFactorY: 0.07,
			scaleFactorZ: 0.25,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.118,
			dY: -0.35,
			dZ: -0.5
		},
	});

	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.07,
			scaleFactorY: 0.07,
			scaleFactorZ: 0.25,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: -0.118,
			dY: -0.35,
			dZ: -0.5
		},
	});

	// Nyan Cat's Tail
	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: [],
		textures: [],
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.05,
			scaleFactorY: 0.05,
			scaleFactorZ: 0.5,
			rotateX: 20,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.0,
			dY: -0.5,
			dZ: 0.0
		},
	});
}

//-------------------------------------------------------------------------------------
function createGroundPlane() {
	groundPlane = {
		child: null,
		geometry: groundPlaneMesh,
		useTexture: [true],
		textureImages: ["stars.png"],
		textures: [],
		color: vec4(0.09, 0.32, 0.55, 1.0),
		materialShininess: 2.0,
		mvParams: {
			scaleFactorX: 0.8,
			scaleFactorY: 0.8,
			scaleFactorZ: 0.8,
			rotateX: 0,
			rotateY: 0,
			rotateZ: 0,
			dX: 0.0,
			dY: 0.0,
			dZ: -0.5
		}
	};
}
