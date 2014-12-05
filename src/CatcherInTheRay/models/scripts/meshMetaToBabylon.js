if (process.argv.length<3 || process.argv.some(function(e){ return e=="--help" || e=="-h" || e=="/?"})){
	console.log("ThreeJS exported file to .babylon converter.");
	console.log("------------");
	console.log("Usage:");
	console.log("node meshMetaToBabylon.js <meshMetaFile> [<output file name>]");
	console.log("------------");
	console.log("Example:");
	console.log("node meshMetaToBabylon.js fox-meshmeta.json [fox2.babylon]");
	return;
}

var fs = require("fs");
var beautify = require('js-beautify').js_beautify;

// Input processing 

var inFile = process.argv[2];
var outFile = inFile.replace("-meshmeta.json",".babylon");
outFile = outFile || process.argv[3];

// End: Input processing


// Loading meshmeta
var fileList;
try{
    fileList = JSON.parse(fs.readFileSync(inFile));
	if (fileList.length) console.log("Loading successful.");
} catch(ex){
	console.log("Error while loading the model: " + inFile);
	console.error(ex);
}
// end : Loading meshmeta

// Picking data from original model

var id = inFile.replace("-meshmeta.json","").split(/[\/\\]/).reverse()[0];
var name = id;

var firstFileName = fileList.shift();
var firstObject = JSON.parse(fs.readFileSync(firstFileName));

var positions = firstObject.vertices;
var colors = firstObject.colors;
var indices = firstObject.indices;
var uvs =  firstObject.uvs;
var normals = firstObject.normals;

var material = null;
var ambient = [0,0,0];
var diffuse = [0.8,0.8,0.8];
var specular = [0,0,0];
var specPower = 0;
var alpha = 1;

var animations = [];
var animName = id+"_anim";

var animationKeys = [];
for(var i=0;i<fileList.length;i++){
	var fileName = fileList[i];
	var frameObject = JSON.parse(fs.readFileSync(fileName));
	var frame = {
	    "frame": i,
	    "values": frameObject.vertices
	};
	animationKeys.push(frame);
}
animationKeys.push({
     "frame": animationKeys.length,
     "values": firstObject.vertices});

var anim = {
    "dataType": 6,
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
    "parentId": null,
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
    "diffuseTexture": null,
    "ambientTexture": null,
    "opacityTexture": null,
    "reflectionTexture": null,
    "emissiveTexture": null,
    "specularTexture": null,
    "bumpTexture": null,
}

var outMesh = {
    "name": name,
    "id": id,
    "tags": "",
    "parentId": null,
    "materialId": outMaterial.id,
    "position": [0,0,0],
    "scaling": [1,1,1],
    "pivotMatrix": null,
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
    "physicsMass": 0,
    "physicsFriction": 0,
    "physicsRestitution": 0,
    "positions": positions,
    "normals": normals,
    "uvs": uvs,
    "uvs2": null,
    "colors": colors,
    "indices": indices,
    "subMeshes": [{
    	"materialIndex":0,
    	"verticesStart":0,
    	"verticesCount":firstObject.vertices.length/3,
    	"indexStart":0,
    	"indexCount":firstObject.indices.length}],
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
fs.writeFileSync(outFile, beautify(JSON.stringify(outObject)) );
console.log("Finished.");

// end: Writing file