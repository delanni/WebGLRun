if (typeof BABYLON !== 'undefined') {

    // The original ground form height map is only able to process images from urls,
    // this extension makes it possibble to generate something to a canvas, then load it as a height map.
    // but Typescript (without hacks) does not allow for further extending classes from the outside, so I need my own hack
    if (typeof BABYLON.Mesh !== 'undefined') {
        Cast<any>(BABYLON.Mesh).CreateGroundFromHeightMapOfCanvas =
        (name: string, canvas: HTMLCanvasElement, width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, scene: BABYLON.Scene, updatable?: boolean) => {
            //BABYLON.Mesh.CreateGroundFromHeightMap(name, url, width, height, subdiv, minhei, maxhei, scene,updatable?);
            var groundBase = BABYLON.Mesh.CreateGround(name, width, height, subdivisions, scene, updatable);

            var context = canvas.getContext("2d");
            var canvasBuffer = context.getImageData(0, 0, canvas.width, canvas.height);

            var vertexData = BABYLON.VertexData.CreateGroundFromHeightMap(width, height, subdivisions, minHeight, maxHeight, canvasBuffer.data, canvasBuffer.width, canvasBuffer.height);

            vertexData.applyToMesh(groundBase, updatable);

            return groundBase;
        }
    }

    // This was somehow not included in the babylon build I'm currently using, so I had to build it myself from a part of typescript file I found
    if (typeof BABYLON.VertexData !== 'undefined') {
        Cast<any>(BABYLON.VertexData).CreateGroundFromHeightMap = function (width, height, subdivisions, minHeight, maxHeight, buffer, bufferWidth, bufferHeight) {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;

            for (row = 0; row <= subdivisions; row++) {
                for (col = 0; col <= subdivisions; col++) {
                    var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));

                    // Compute height
                    var heightMapX = (((position.x + width / 2) / width) * (bufferWidth - 1)) | 0;
                    var heightMapY = ((1.0 - (position.z + height / 2) / height) * (bufferHeight - 1)) | 0;

                    var pos = (heightMapX + heightMapY * bufferWidth) * 4;
                    var r = buffer[pos] / 255.0;
                    var g = buffer[pos + 1] / 255.0;
                    var b = buffer[pos + 2] / 255.0;

                    var gradient = r * 0.3 + g * 0.59 + b * 0.11;

                    position.y = minHeight + (maxHeight - minHeight) * gradient;

                    // Add  vertex
                    positions.push(position.x, position.y, position.z);
                    normals.push(0, 0, 0);
                    uvs.push(col / subdivisions, 1.0 - row / subdivisions);
                }
            }

            for (row = 0; row < subdivisions; row++) {
                for (col = 0; col < subdivisions; col++) {
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + row * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));

                    indices.push(col + (row + 1) * (subdivisions + 1));
                    indices.push(col + 1 + (row + 1) * (subdivisions + 1));
                    indices.push(col + row * (subdivisions + 1));
                }
            }

            // Normals
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        };
    }

}