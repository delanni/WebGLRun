module TERRAIN {

    export interface TerrainGeneratorParams {
        width: number;
        height: number;
        subdivisions: number;
        minHeight: number;
        maxHeight: number;
        displayCanvas: boolean;
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
            //return [height, height, height];
        }

        public ColorizeMesh(mesh: BABYLON.Mesh) {
            var positionData = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var colorData = [];

            Trace("Mapping");
            var copy = positionData.map(function (x, i) { return i % 3 == 1 ? x : 0 });
            Trace("Mapping");

            Trace("Min/Max");
            //var copySorted = copy.sort((a,b)=>a>b?1:-1);
            //this._maxHeight = copy.pop();
            //this._minHeight = copy.shift();
            console.log("Total number of vertices:" + copy.length / 3);
            //this._maxHeight = copy.reduce((lastItem, newItem) => lastItem > newItem ? lastItem : newItem);
            this._maxHeight = Math.max.apply(null, copy);
            //this._minHeight = copy.reduce((lastItem, newItem) => lastItem < newItem ? lastItem : newItem);
            this._minHeight = Math.min.apply(null, copy);
            var heightScale = this._maxHeight - this._minHeight;

            Trace("Min/Max");

            Trace("Color fetching");
            for (var i = 1; i < positionData.length; i += 3) {
                var h = (positionData[i] - this._minHeight) / heightScale;
                var color = this.getHeightColorFor(h);
                colorData.push(color[0] / 255, color[1] / 255, color[2] / 255);
            }
            Trace("Color fetching");

            mesh.setVerticesData(BABYLON.VertexBuffer.ColorKind, colorData, true);
        }

        public GenerateWrappingMesh(mesh: BABYLON.Mesh, scene: BABYLON.Scene): BABYLON.Mesh {
            var vertices = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            var bbox = mesh.getBoundingInfo();
            var xMin = bbox.minimum.x;
            var xMax = bbox.maximum.x;
            var zMin = bbox.minimum.z;
            var zMax = bbox.maximum.z;
            var yMin = bbox.minimum.y;
            var yMax = bbox.maximum.y;
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
            var actualBottomShift = 0;
            var maxDistance = Math.sqrt(xMin * xMin + zMin * zMin);
            for (var i = 0; i < vertices.length; i += 3) {
                var x = vertices[i];
                var y = vertices[i + 1];
                var z = vertices[i + 2];
                var d = Math.sqrt(x * x + z * z);
                if (checkTriadIsOnXEdge(x, y, z)) {
                    if (x == xMin) xLeft.push(x, y, z, x, -70 - Math.floor(100 * maxDistance / d) + (Math.random() * 20), z);
                    else xRight.unshift(x, y, z, x, -70 - Math.floor(100 * maxDistance / d) + (Math.random() * 20), z);
                } else if (checkTriadIsOnZEdge(x, y, z)) {
                    if (z == zMin) zBottom.push(x, y, z, x, -70 - Math.floor(100 * maxDistance / d) + (Math.random() * 20), z);
                    else zTop.unshift(x, y, z, x, -70 - Math.floor(100 * maxDistance / d) + (Math.random() * 20), z);
                }

            }
            var wrappingPoints = xRight.concat(zTop, xLeft, zBottom);
            var wrappingUvs = [];
            var uvxprog = 1 / (wrappingPoints.length / 6);
            for (var i = 0; i < wrappingPoints.length / 3; i += 2) {
                wrappingUvs.push(uvxprog * i, wrappingPoints[3 * i + 1] / yMax, uvxprog * i,0);
            }

            var wrappingIndices = [];
            var triplets = wrappingPoints.length / 3; // = subdiv * 8
            for (var i = 0; i < triplets; i += 2) {
                wrappingIndices.push(i, (i + 1) % triplets, (i + 3) % triplets);
                wrappingIndices.push((i + 2) % triplets, i, (i + 3) % triplets);
            }

            var wrappingNormals = [];
            BABYLON.VertexData.ComputeNormals(wrappingPoints, wrappingIndices, wrappingNormals);

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