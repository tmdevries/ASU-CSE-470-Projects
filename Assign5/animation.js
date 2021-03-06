//-------------------------------------------------------------------------------------
// animation.js
// This file contains the functions that relate to moving the hierarchical creature 
// around the scene.
//-------------------------------------------------------------------------------------

//-------------------------------------------------------------------------------------
// Global Variables
//-------------------------------------------------------------------------------------

var wait = { max: 200, now: 0};

//-------------------------------------------------------------------------------------
function animate() {
    // TARA: start by moving the individual parts of the nyan
    // cat: the head (w/ ears!), legs, and tail
    rotatePartWithReverse(nyanCat.child[1], [-25,0,0], [25,0,0]); // first leg
    rotatePartWithReverse(nyanCat.child[2], [-25,0,0], [25,0,0]); // second leg
    rotatePartWithReverse(nyanCat.child[3], [-25,0,0], [25,0,0]); // third leg
    rotatePartWithReverse(nyanCat.child[4], [-25,0,0], [25,0,0]); // fourth leg, all rotate 
                                                                  // forwards and backwards
    rotatePartWithReverse(nyanCat.child[5], [0,-20,0], [0,20,0]); // tail, swishes back and forth

    rotatePartAndChildren(nyanCat, 1.25, 2); // start with a circle path, moving entire cat.
    jump(); // make cat jump or make its head bob up and down while it runs
}

//-------------------------------------------------------------------------------------
function rotatePartWithReverse(part, lowerLimit, upperLimit) {
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
function translatePartWithReverse(part, lowerLimit, upperLimit) {
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
// NOTE: This ONLY works because all parts are initially rotated 180 degrees about the
// z axis. If this isn't the case, the parts won't move to the same location.
//-------------------------------------------------------------------------------------
function translatePartAndChildren(part, delta, index) {
    part.mvParams.currentTranslation[index]+=delta;
    if (part.child !== null) {
        for (var i = 0; i < part.child.length; i++) {
            translatePartAndChildren(part.child[i], delta, index);
        }
    }
}

//-------------------------------------------------------------------------------------
function jump() {
    if (wait.now===0) {
        // Now start the jump since it no longer needs to wait
        translatePartWithReverse(nyanCat, [0,0,0], [0,0,0.5]);
    }
    if (nyanCat.mvParams.currentTranslation[2]+nyanCat.animation.translationDelta[2]<0.0) {
        wait.now = wait.max; // reset the wait clock once the jump is complete
        nyanCat.animation.translationDelta[2]= -nyanCat.animation.translationDelta[2]; // reset dZ
    }
    if (wait.now > 0) {
        // bob head up and down, only if not jumping
        translatePartWithReverse(nyanCat.child[0], [0,0,-0.2], [0,0,-0.1]);
        wait.now--; // only decrememnt if Nyan is waiting to jump
    }
}