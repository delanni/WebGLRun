if (typeof BABYLON !== 'undefined') {

    // The original ground form height map is only able to process images from urls,
    // this extension makes it possibble to generate something to a canvas, then load it as a height map.
    // but Typescript (without hacks) does not allow for further extending classes from the outside, so I need my own hack
    if (typeof BABYLON.Mesh !== 'undefined') {
        BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas =
        (name: string, canvas: HTMLCanvasElement, width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, scene: BABYLON.Scene, updatable?: boolean) => {
            var groundBase = BABYLON.Mesh.CreateGround(name, width, height, subdivisions, scene, updatable);

            var context = canvas.getContext("2d");
            var canvasBuffer = context.getImageData(0, 0, canvas.width, canvas.height);

            var vertexData = Cast<any>(BABYLON.VertexData).CreateGroundFromHeightMap(width, height, subdivisions, minHeight, maxHeight,canvasBuffer.data, canvasBuffer.width, canvasBuffer.height);
            vertexData.applyToMesh(groundBase, updatable);

            return groundBase;
        }
    }
}