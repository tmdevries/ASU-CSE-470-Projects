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
function createNyanCat() {
	nyanCat = {
		child: [],
		geometry: cubeMesh,
		useTexture: [false, false, false, false, true, false],
		textureImages: [null, null, null, null, "body.png", null],
		textures: [],
		color: vec4(0.98, 0.8, 0.62, 1.0),
		materialShininess: 12.8,
		mvParams: {
			scaleFactor: [0.05,0.5,0.35],
			currentRotation: [0,0,180],
			currentTranslation: [0,0,0]
		},
		animation: {
			rotationAngle: null,
			translationDelta: [0.0,0.0,0.02]
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
			scaleFactor: [0.3,0.25,0.1],
			currentRotation: [90,0,180],
			currentTranslation: [0,0.6,-0.15]
		},
		animation: {
			rotationAngle: null,
			translationDelta: [0,0,-0.0075]
		}
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
			scaleFactor: [0.17,0.25,0.05],
			currentRotation: [90,44,180],
			currentTranslation: [0.15,0.55,-0.05]
		},
		animation: null
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
			scaleFactor: [0.17,0.25,0.05],
			currentRotation: [90,-44,180],
			currentTranslation: [-0.15,0.55,-0.05]
		},
		animation: null
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
			scaleFactor: [0.07,0.07,0.25],
			currentRotation: [0,180,180],
			currentTranslation: [0.118,0.35,-0.25]
		},
		animation: {
			rotationAngle: [1.5,0,0],
			translationDelta: null
		}
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
			scaleFactor: [0.07,0.07,0.25],
			currentRotation: [0,180,180],
			currentTranslation: [-0.118,0.35,-0.25]
		},
		animation: {
			rotationAngle: [1.5,0,0],
			translationDelta: null
		}
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
			scaleFactor: [0.07,0.07,0.25],
			currentRotation: [0,180,180],
			currentTranslation: [0.118,-0.35,-0.25]
		},
		animation: {
			rotationAngle: [-1.5,0,0],
			translationDelta: null
		}
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
			scaleFactor: [0.07,0.07,0.25],
			currentRotation: [0,180,180],
			currentTranslation: [-0.118,-0.35,-0.25]
		},
		animation: {
			rotationAngle: [-1.5,0,0],
			translationDelta: null
		}
	});

	// Nyan Cat's Tail
	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		useTexture: [false, false, false],
		textureImages: null,
		textures: null,
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactor: [0.05,0.05,0.5],
			currentRotation: [20,0,180],
			currentTranslation: [0.0,-0.5,0.0]
		},
		animation: {
			rotationAngle: [0,1,0],
			translationDelta: null
		}
	});

	// Finally, a "ground plane" with uniform texture coordinates to
	// make a rainbow come out from behind Nyan Cat.
	nyanCat.child.push({
		child: null,
		geometry: uniformGroundPlaneMesh,
		useTexture: [false],
		textureImages: null,
		textures: null,
		color: vec4(0.09, 0.32, 0.55, 0.0),
		materialShininess: null,
		mvParams: {
			scaleFactor: [0.35, 0.8, 1],
			currentRotation: [0,90,180],
			currentTranslation: [0,-1,0]
		},
		animation: null
	});

	// TARA: This will be the Nyan Cat's starting position, so that rotation about the 
	// Z axis will cause it to move in a circle. The larger the second parameter is, 
	// larger the circlular path ends up being. (It is the radius of the circle path.)
	translatePartAndChildren(nyanCat, 1.5, 0);
}

//-------------------------------------------------------------------------------------
function createGroundPlane() {
	groundPlane = {
		child: null,
		geometry: patternedGroundPlaneMesh,
		useTexture: [true],
		textureImages: ["stars.png"],
		textures: [],
		color: vec4(0.09, 0.32, 0.55, 1.0),
		materialShininess: 2.0,
		mvParams: {
			scaleFactor: [2.5,2.5,2.5],
			currentRotation: [0,0,0],
			currentTranslation: [0,0,-0.5]
		}
	};
}
