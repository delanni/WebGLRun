module TERRAIN {

    export interface TerrainGeneratorParams extends HeightMapGeneratorParams {
        subdivisions: number;
        randomSeed: number;
        minHeight: number;
        maxHeight: number;
        colors?: any[];
    }

    export class TerrainGenerator {

        private _maxHeight: number;
        private _minHeight: number;
        private _gradientBase: number = 0;
        private _gradient: ImageData;
        public Parameters: TerrainGeneratorParams;

        constructor(params: TerrainGeneratorParams) {
            this.Parameters = params;
            this.Parameters.colors = this.Parameters.colors ||
            [[0, "#088A08"], [0.0111, "#088A08"], [0.0112, "#5E610B"], [0.7, "#190B07"], [1, "#BDBDBD"]];
            // LIGHTGREEN     YELLOW                YELLOW              DARKBROWN           GREY
        }

        private getHeightColorFor(height: number): number[] {
            var gradientCanvas: HTMLCanvasElement;
            var width = this._maxHeight | 0 - this._minHeight | 0;

            if (this._gradient == null) {
                gradientCanvas = CreateCanvas(width, 2, this.Parameters.displayCanvas, "gradientsCanvas");
                var ctx = gradientCanvas.getContext("2d");
                var mountainGradient = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                var gradient2 = ctx.createLinearGradient(0, 0, gradientCanvas.width, 1);
                for (var i = 0; i < this.Parameters.colors.length; i++) {
                    var colorStop = this.Parameters.colors[i];
                    mountainGradient.addColorStop(colorStop[0], colorStop[1]);
                }
                gradient2.addColorStop(0, "#000000");
                gradient2.addColorStop(1, "#ffffff");
                ctx.fillStyle = mountainGradient;
                ctx.fillRect(0, 0, gradientCanvas.width, 1);
                ctx.fillStyle = gradient2;
                ctx.fillRect(0, 1, gradientCanvas.width, 1);
                this._gradient = ctx.getImageData(0, 0, gradientCanvas.width, gradientCanvas.height);
            }
            var index = (height * (width) * 4) | 0;
            index -= index % 4;
            index = index % ((width) * 4);
            index += this._gradientBase;
            return [this._gradient.data[index], this._gradient.data[index + 1], this._gradient.data[index + 2]];
        }

        public ColorizeMesh(mesh: BABYLON.Mesh) {
            var positionData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var colorData = [];

            var maxVec = mesh.getBoundingInfo().boundingBox.maximum;
            var minVec = mesh.getBoundingInfo().boundingBox.minimum;

            this._maxHeight = maxVec.y;
            this._minHeight = minVec.y;
            var heightScale = this._maxHeight - this._minHeight;

            Trace("Color fetching");
            for (var i = 1; i < positionData.length; i += 3) {
                var h = (positionData[i] - this._minHeight) / heightScale;
                var color = this.getHeightColorFor(h);
                colorData.push(color[0] / 255, color[1] / 255, color[2] / 255);
            }
            Trace("Color fetching");

            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorData, true);
        }

        /**
         * This function takes a mesh that's the mountains' mesh data, and creates a wrapping
         * mesh around it, that hides its intestines, so that it will look like a piece of 
         * ground chopped out of Earth.
         */
        public GenerateWrappingMesh(mesh: BABYLON.Mesh, scene: BABYLON.Scene): BABYLON.Mesh {

            // Get vertex info
            var vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);

            // Get info about the edges
            var bbox = mesh.getBoundingInfo();
            var xMin = bbox.minimum.x;
            var xMax = bbox.maximum.x;
            var zMin = bbox.minimum.z;
            var zMax = bbox.maximum.z;
            var yMin = bbox.minimum.y;
            var yMax = bbox.maximum.y;

            // Create predicates for edge test
            var checkTriadIsOnXEdge = function (x: number, y: number, z: number): boolean {
                if (x == xMin || x == xMax) return true;
                return false;
            }
            var checkTriadIsOnZEdge = function (x: number, y: number, z: number): boolean {
                if (z == zMin || z == zMax) return true;
                return false;
            }

            var xLeft = [];
            var xRight = [];
            var zTop = [];
            var zBottom = [];
            var maxDistance = Math.sqrt(xMin * xMin + zMin * zMin);
            for (var i = 0; i < vertices.length; i += 3) {
                var x = vertices[i];
                var y = vertices[i + 1];
                var z = vertices[i + 2];
                var d = Math.sqrt(x * x + z * z);
                var bottomCoverHeight =  -70 - Math.floor(100 * maxDistance / d);
                // categorize vertices to different arrays, and push 3 additional coordinates for each vertex
                // the additional ones are the bottom's parts
                if (checkTriadIsOnXEdge(x, y, z)) {
                    if (x == xMin) xLeft.push(x, y, z, x, bottomCoverHeight  + (Math.random() * 20), z);
                    else xRight.unshift(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                } else if (checkTriadIsOnZEdge(x, y, z)) {
                    if (z == zMin) zBottom.push(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                    else zTop.unshift(x, y, z, x, bottomCoverHeight + (Math.random() * 20), z);
                }
            }
            // concatenate the different parts to a contiguous array
            // ordered as if going around the map's edge
            var wrappingPoints = xRight.concat(zTop, xLeft, zBottom);
            var wrappingUvs = [];

            // guess the uv coordinates (tried a lot, but still buggy)
            var uvxprog = 1 / (wrappingPoints.length / 6);
            for (var i = 0; i < wrappingPoints.length / 3; i += 2) {
                wrappingUvs.push(uvxprog * i, wrappingPoints[3 * i + 1] / yMax, uvxprog * i,0);
            }

            // generate indices for the newly created faces
            var wrappingIndices = [];
            var triplets = wrappingPoints.length / 3;
            for (var i = 0; i < triplets; i += 2) {
                // 2 faces for each quad
                wrappingIndices.push(i, (i + 1) % triplets, (i + 3) % triplets);
                wrappingIndices.push((i + 2) % triplets, i, (i + 3) % triplets);
            }

            var wrappingNormals = [];
            BABYLON.VertexData.ComputeNormals(wrappingPoints, wrappingIndices, wrappingNormals);

            // install vertex data, and generate mesh
            var vertexData = new BABYLON.VertexData();
            vertexData.indices = wrappingIndices;
            vertexData.positions = wrappingPoints;
            vertexData.normals = wrappingNormals;
            vertexData.uvs = wrappingUvs;
            var wrappingMesh = new BABYLON.Mesh("wrapper", scene);
            vertexData.applyToMesh(wrappingMesh, false);

            return wrappingMesh;
        }

        public ConvertNoiseToBabylonMesh(noise: HTMLCanvasElement, scene: BABYLON.Scene): BABYLON.Mesh {
            var terrainMesh = BABYLON.Mesh.CreateGroundFromHeightMapOfCanvas(
                name, noise, this.Parameters.width, this.Parameters.height,
                this.Parameters.subdivisions, this.Parameters.minHeight, this.Parameters.maxHeight,
                scene, false);
            return terrainMesh;
        }
    }
}