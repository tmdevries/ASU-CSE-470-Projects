//-------------------------------------------------------------------------------------
// modelData.js
// This file contains global variables and functions for setting up the Nyan Cat model,
// such as the hierarchical structure, the transformation matrices, colors, textures,
// etc.
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Global Variables
//-------------------------------------------------------------------------------------
var nyanCat = {
	child: [],
	geometry: cubeMesh,
	color: vec4(0.98, 0.8, 0.62, 1.0),
	materialShininess: 12.8,
	mvParams: {
		scaleFactorX: 0.3,
		scaleFactorY: 0.3,
		scaleFactorZ: 0.5,
		rotateTheta: 0.0,
		dX: 0.0,
		dY: 0.0,
		dZ: 0.0
	}
};

var groundPlane = {
	child: null,
	geometry: groundPlaneMesh,
	color: vec4(0.09, 0.32, 0.55, 1.0),
	materialShininess: 2.0,
	mvParams: {
		scaleFactorX: 0.3,
		scaleFactorY: 0.3,
		scaleFactorZ: 0.5,
		rotateTheta: 0.0,
		dX: 0.0,
		dY: 0.0,
		dZ: 0.0
	}
};

//-------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------
function createNyanCat() {
	// Nyan Cat's Head
	nyanCat.child.push({
		child: [ear1, ear2],
		geometry: cylinderMesh,
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.3,
			scaleFactorY: 0.3,
			scaleFactorZ: 0.5,
			rotateTheta: 0.0,
			dX: 0.0,
			dY: 0.0,
			dZ: 0.0
		},
	});

	// 2 Ears
	for (var i = 1; i <= 2; i++) {
		nyanCat.child[0].child.push({
			child: null,
			geometry: squarePyramidMesh,
			color: vec4(0.6, 0.6, 0.6, 1.0),
			materialShininess: nyanCat.materialShininess,
			mvParams: {
				scaleFactorX: 0.3,
				scaleFactorY: 0.3,
				scaleFactorZ: 0.5,
				rotateTheta: 0.0,
				dX: 0.0,
				dY: 0.0,
				dZ: 0.0
			},
		});
	}

	// 4 Legs
	for (i = 1; i <= 4; i++) {
		nyanCat.child.push({
			child: null,
			geometry: cylinderMesh,
			color: vec4(0.6, 0.6, 0.6, 1.0),
			materialShininess: nyanCat.materialShininess,
			dmvParams: {
				scaleFactorX: 0.3,
				scaleFactorY: 0.3,
				scaleFactorZ: 0.5,
				rotateTheta: 0.0,
				dX: 0.0,
				dY: 0.0,
				dZ: 0.0
			},
		});
	}

	// Nyan Cat's Tail
	nyanCat.child.push({
		child: null,
		geometry: cylinderMesh,
		color: vec4(0.6, 0.6, 0.6, 1.0),
		materialShininess: nyanCat.materialShininess,
		mvParams: {
			scaleFactorX: 0.3,
			scaleFactorY: 0.3,
			scaleFactorZ: 0.5,
			rotateTheta: 0.0,
			dX: 0.0,
			dY: 0.0,
			dZ: 0.0
		},
	});

}

function drawHead() {

}