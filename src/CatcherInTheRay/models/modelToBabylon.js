if (process.argv.length<3 || process.argv.some(function(e){ return e=="--help" || e=="-h" || e=="/?"})){
	console.log("ThreeJS exported file to .babylon converter.");
	console.log("------------");
	console.log("Usage:");
	console.log("node modelToBabylon.js <inputfile> [<output file name>]");
	console.log("------------");
	console.log("Example:");
	console.log("node modelToBabylon.js fox.js [fox2.babylon]");
	return;
}

// Input processing 

var inFile = process.argv[2];
var outFile = inFile.split(".");
if (outFile[outFile.length-1]=="js" || outFile[outFile.length-1]=="txt" || outFile[outFile.length-1]=="in" ) outFile.pop();

if (process.argv[3]){
	outFile = process.argv[3];
	if (outFile.indexOf(".")>0){
		outFile = outFile.split(".");
		
		if (outFile[outFile.length-1]=="js" || outFile[outFile.length-1]=="txt" || outFile[outFile.length-1]=="in" ) outFile.pop();
	}
}

outFile.push("babylon");
outFile = outFile.join(".");

if (inFile.indexOf("\\")<0 && inFile.indexOf("/")<0)
	inFile ="./"+inFile;
// End: Input processing


// Loading original model

var model;
try{
	model = require(inFile);
	if (model.vertices){
		console.log("Loading successful.");
	}
} catch(ex){
	console.log("Error while loading the model: " + inFile);
	console.error(ex);
}

// end : Loading model


// Picking data from original model

var id = (function(of){var c = of.split("."); c.pop(); var c = c.pop(); c.replace(/[^a-zA-Z0-9]/g,""); return c;})(outFile);
var name = id;
var positions = model.vertices;
var colors = model.morphColors[0][Object.keys(model.morphColors[0])[0]];
var indices = model.faces;
var uvs = model.uvs[0];

var material = model.materials[0];
var ambient = material.colorAmbient;
var diffuse = material.colorDiffuse;
var specular = material.colorSpecular;
var specPower = material.illumination;
var alpha = material.opticalDensity;

var animations = [];
var morphTargets = model.morphTargets;
var animName = morphTargets[0].name.split("_")[0];

var animationKeys = [];
for(var i=0;i<morphTargets.length;i++){
	var frame = {
	    "frame": i,
	    "values": morphTargets[i].vertices
	};
	animationKeys.push(frame);
}

var anim = {
    "dataType": 0,
    "framePerSecond": 1,
    "loopBehavior": 1,
    "name": animName,
    "property": "vertexData",
    "keys":  animationKeys,
    "autoAnimate": false,
    "autoAnimateFrom": 0,
    "autoAnimateTo": 0,
    "autoAnimateLoop": false
}

animations.push(anim);

// end: Picking data

// Creating output objects

var basicCamera = {
    "name": "dummy",
    "id": "dummyCam",
    "type": "FreeCamera",
    "tags": "",
    "parentId": undefined,
    "lockedTargetId": id,
    "position": [5,5,5],
    "target": [0,0,0],
    "alpha": 0, // only for ArcRotateCamera and AnaglyphArcRotateCamera
    "beta": 0, // only for ArcRotateCamera and AnaglyphArcRotateCamera
    "radius": 50, // only for ArcRotateCamera and AnaglyphArcRotateCamera
    "eye_space": 40, // only for AnaglyphFreeCamera and AnaglyphArcRotateCamera
    "heightOffset": 10, // only for FollowCamera
    "radius": 10, // only for FollowCamera
    "rotationOffset": 5, // only for FollowCamera
    "fov": 40,
    "minZ": 0,
    "maxZ": 500,
    "speed": 1,
    "inertia": 0.5,
    "checkCollisions": false,
    "applyGravity": false,
    "ellipsoid": [0,0,0]
}

var dummyLight = {
    "name": "dummyLight",
    "id": "dummyLight",
    "tags": "",
    "type": 1,
    "position": [0,50,0],
    "direction": [0,-50,0],
    "intensity": 80,
    "range": 800,
    "diffuse": diffuse,
    "specular": specular
}

var outMaterial = {
    "name": "Material_"+name,
    "id": "mat_"+id,
    "tags": "",
    "ambient": ambient,
    "diffuse": diffuse,
    "specular": specular,
    "specularPower": specPower,
    "emissive": [0,0,0],
    "alpha": alpha,
    "backFaceCulling": false,
    "wireframe": false,
    "diffuseTexture": undefined,
    "ambientTexture": undefined,
    "opacityTexture": undefined,
    "reflectionTexture": undefined,
    "emissiveTexture": undefined,
    "specularTexture": undefined,
    "bumpTexture": undefined,
}

var outMesh = {
    "name": name,
    "id": id,
    "tags": "",
    "parentId": undefined,
    "materialId": outMaterial.id,
    "position": [0,0,0],
    "scaling": [1,1,1],
    "pivotMatrix": undefined,
    "infiniteDistance": false,
    "showBoundingBox": false,
    "showSubMeshesBoundingBox": false,
    "isVisible": true,
    "isEnabled": true,
    "pickable": true,
    "checkCollisions": false,
    "billboardMode": 0,
    "receiveShadows": false,
    "physicsImpostor": 1,
    "physicsMass": 1,
    "physicsFriction": 0,
    "physicsRestitution": 0,
    "positions": positions,
    "normals": [],
    "uvs": uvs,
    "uvs2": undefined,
    "colors": colors,
    "indices": indices,
    "subMeshes": [],
    "animations": animations,
    "autoAnimate": false,
    "autoAnimateFrom": 0,
    "autoAnimateTo": 0,
    "autoAnimateLoop": false,
    "instances": [],
}

var outObject = {
    "autoClear": true,
    "clearColor": [0.2,0.2,0.2],
    "ambientColor": [0.2,0.2,0.2],
    "gravity": [0,-9,0],
    "cameras": [basicCamera],
    "activeCamera_": "dummyCam",
    "lights": [dummyLight],
    "materials": [outMaterial],
    "geometries": {
	    "boxes":[],
	    "spheres": [],
	    "cylinders": [],
	    "toruses": [],
	    "grounds": [],
	    "planes": [],
	    "torusKnots": [],
	    "vertexData": []
	},
    "meshes": [outMesh], // The only interesting part
    "multiMaterials": [],
    "shadowGenerators": [],
    "skeletons": [],
    "particleSystems": [],
    "lensFlareSystems": []
};

// end: Creating output objects

// Writing out file

console.log("Writing file: " + outFile);
var fs = require("fs");
fs.writeFileSync(outFile, JSON.stringify(outObject) );
console.log("Finished.");

// end: Writing file