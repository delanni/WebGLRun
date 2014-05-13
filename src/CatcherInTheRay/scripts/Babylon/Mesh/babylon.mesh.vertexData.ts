﻿module BABYLON {
    export class VertexData {
        public positions: number[];
        public normals: number[];
        public uvs: number[];
        public uv2s: number[];
        public colors: number[];
        public matricesIndices: number[];
        public matricesWeights: number[];
        public indices: number[];

        public applyToMesh(mesh: Mesh, updatable?: boolean): void {
            if (this.positions) {
                mesh.setVerticesData(this.positions, BABYLON.VertexBuffer.PositionKind, updatable);
            }

            if (this.normals) {
                mesh.setVerticesData(this.normals, BABYLON.VertexBuffer.NormalKind, updatable);
            }

            if (this.uvs) {
                mesh.setVerticesData(this.uvs, BABYLON.VertexBuffer.UVKind, updatable);
            }

            if (this.uv2s) {
                mesh.setVerticesData(this.uv2s, BABYLON.VertexBuffer.UV2Kind, updatable);
            }

            if (this.colors) {
                mesh.setVerticesData(this.colors, BABYLON.VertexBuffer.ColorKind, updatable);
            }

            if (this.matricesIndices) {
                mesh.setVerticesData(this.matricesIndices, BABYLON.VertexBuffer.MatricesIndicesKind, updatable);
            }

            if (this.matricesWeights) {
                mesh.setVerticesData(this.matricesWeights, BABYLON.VertexBuffer.MatricesWeightsKind, updatable);
            }

            if (this.indices) {
                mesh.setIndices(this.indices);
            }
        }

        public transform(matrix: Matrix): void {
            var transformed = BABYLON.Vector3.Zero();

            if (this.positions) {
                var position = BABYLON.Vector3.Zero();

                for (var index = 0; index < this.positions.length; index += 3) {
                    BABYLON.Vector3.FromArrayToRef(this.positions, index, position);

                    BABYLON.Vector3.TransformCoordinatesToRef(position, matrix, transformed);
                    this.positions[index] = transformed.x;
                    this.positions[index + 1] = transformed.y;
                    this.positions[index + 2] = transformed.z;
                }
            }

            if (this.normals) {
                var normal = BABYLON.Vector3.Zero();

                for (index = 0; index < this.normals.length; index += 3) {
                    BABYLON.Vector3.FromArrayToRef(this.normals, index, normal);

                    BABYLON.Vector3.TransformNormalToRef(normal, matrix, transformed);
                    this.normals[index] = transformed.x;
                    this.normals[index + 1] = transformed.y;
                    this.normals[index + 2] = transformed.z;
                }
            }
        }

        public merge(other: VertexData): void {
            if (other.indices) {
                if (!this.indices) {
                    this.indices = [];
                }

                var offset = this.positions ? this.positions.length / 3 : 0;
                for (var index = 0; index < other.indices.length; index++) {
                    this.indices.push(other.indices[index] + offset);
                }
            }

            if (other.positions) {
                if (!this.positions) {
                    this.positions = [];
                }

                for (index = 0; index < other.positions.length; index++) {
                    this.positions.push(other.positions[index]);
                }
            }

            if (other.normals) {
                if (!this.normals) {
                    this.normals = [];
                }
                for (index = 0; index < other.normals.length; index++) {
                    this.normals.push(other.normals[index]);
                }
            }

            if (other.uvs) {
                if (!this.uvs) {
                    this.uvs = [];
                }
                for (index = 0; index < other.uvs.length; index++) {
                    this.uvs.push(other.uvs[index]);
                }
            }

            if (other.uv2s) {
                if (!this.uv2s) {
                    this.uv2s = [];
                }
                for (index = 0; index < other.uv2s.length; index++) {
                    this.uv2s.push(other.uv2s[index]);
                }
            }

            if (other.matricesIndices) {
                if (!this.matricesIndices) {
                    this.matricesIndices = [];
                }
                for (index = 0; index < other.matricesIndices.length; index++) {
                    this.matricesIndices.push(other.matricesIndices[index]);
                }
            }

            if (other.matricesWeights) {
                if (!this.matricesWeights) {
                    this.matricesWeights = [];
                }
                for (index = 0; index < other.matricesWeights.length; index++) {
                    this.matricesWeights.push(other.matricesWeights[index]);
                }
            }

            if (other.colors) {
                if (!this.colors) {
                    this.colors = [];
                }
                for (index = 0; index < other.colors.length; index++) {
                    this.colors.push(other.colors[index]);
                }
            }
        }

        // Statics
        public static ExtractFromMesh(mesh: Mesh): VertexData {
            var result = new BABYLON.VertexData();

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.PositionKind)) {
                result.positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.NormalKind)) {
                result.normals = mesh.getVerticesData(BABYLON.VertexBuffer.NormalKind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UVKind)) {
                result.uvs = mesh.getVerticesData(BABYLON.VertexBuffer.UVKind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.UV2Kind)) {
                result.uv2s = mesh.getVerticesData(BABYLON.VertexBuffer.UV2Kind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.ColorKind)) {
                result.colors = mesh.getVerticesData(BABYLON.VertexBuffer.ColorKind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesIndicesKind)) {
                result.matricesIndices = mesh.getVerticesData(BABYLON.VertexBuffer.MatricesIndicesKind);
            }

            if (mesh.isVerticesDataPresent(BABYLON.VertexBuffer.MatricesWeightsKind)) {
                result.matricesWeights = mesh.getVerticesData(BABYLON.VertexBuffer.MatricesWeightsKind);
            }

            result.indices = mesh.getIndices();

            return result;
        }

        public static CreateBox(size: number): VertexData {
            var normalsSource = [
                new BABYLON.Vector3(0, 0, 1),
                new BABYLON.Vector3(0, 0, -1),
                new BABYLON.Vector3(1, 0, 0),
                new BABYLON.Vector3(-1, 0, 0),
                new BABYLON.Vector3(0, 1, 0),
                new BABYLON.Vector3(0, -1, 0)
            ];

            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            size = size || 1;

            // Create each face in turn.
            for (var index = 0; index < normalsSource.length; index++) {
                var normal = normalsSource[index];

                // Get two vectors perpendicular to the face normal and to each other.
                var side1 = new BABYLON.Vector3(normal.y, normal.z, normal.x);
                var side2 = BABYLON.Vector3.Cross(normal, side1);

                // Six indices (two triangles) per face.
                var verticesLength = positions.length / 3;
                indices.push(verticesLength);
                indices.push(verticesLength + 1);
                indices.push(verticesLength + 2);

                indices.push(verticesLength);
                indices.push(verticesLength + 2);
                indices.push(verticesLength + 3);

                // Four vertices per face.
                var vertex = normal.subtract(side1).subtract(side2).scale(size / 2);
                positions.push(vertex.x, vertex.y, vertex.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(1.0, 1.0);

                vertex = normal.subtract(side1).add(side2).scale(size / 2);
                positions.push(vertex.x, vertex.y, vertex.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(0.0, 1.0);

                vertex = normal.add(side1).add(side2).scale(size / 2);
                positions.push(vertex.x, vertex.y, vertex.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(0.0, 0.0);

                vertex = normal.add(side1).subtract(side2).scale(size / 2);
                positions.push(vertex.x, vertex.y, vertex.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(1.0, 0.0);
            }

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        public static CreateSphere(segments: number, diameter: number): VertexData {

            segments = segments || 32;
            diameter = diameter || 1;

            var radius = diameter / 2;

            var totalZRotationSteps = 2 + segments;
            var totalYRotationSteps = 2 * totalZRotationSteps;

            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            for (var zRotationStep = 0; zRotationStep <= totalZRotationSteps; zRotationStep++) {
                var normalizedZ = zRotationStep / totalZRotationSteps;
                var angleZ = (normalizedZ * Math.PI);

                for (var yRotationStep = 0; yRotationStep <= totalYRotationSteps; yRotationStep++) {
                    var normalizedY = yRotationStep / totalYRotationSteps;

                    var angleY = normalizedY * Math.PI * 2;

                    var rotationZ = BABYLON.Matrix.RotationZ(-angleZ);
                    var rotationY = BABYLON.Matrix.RotationY(angleY);
                    var afterRotZ = BABYLON.Vector3.TransformCoordinates(BABYLON.Vector3.Up(), rotationZ);
                    var complete = BABYLON.Vector3.TransformCoordinates(afterRotZ, rotationY);

                    var vertex = complete.scale(radius);
                    var normal = BABYLON.Vector3.Normalize(vertex);

                    positions.push(vertex.x, vertex.y, vertex.z);
                    normals.push(normal.x, normal.y, normal.z);
                    uvs.push(normalizedZ, normalizedY);
                }

                if (zRotationStep > 0) {
                    var verticesCount = positions.length / 3;
                    for (var firstIndex = verticesCount - 2 * (totalYRotationSteps + 1); (firstIndex + totalYRotationSteps + 2) < verticesCount; firstIndex++) {
                        indices.push((firstIndex));
                        indices.push((firstIndex + 1));
                        indices.push(firstIndex + totalYRotationSteps + 1);

                        indices.push((firstIndex + totalYRotationSteps + 1));
                        indices.push((firstIndex + 1));
                        indices.push((firstIndex + totalYRotationSteps + 2));
                    }
                }
            }

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        public static CreateCylinder(height: number, diameterTop: number, diameterBottom: number, tessellation: number): VertexData {
            var radiusTop = diameterTop / 2;
            var radiusBottom = diameterBottom / 2;
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            height = height || 1;
            diameterTop = diameterTop || 0.5;
            diameterBottom = diameterBottom || 1;
            tessellation = tessellation || 16;

            var getCircleVector = i => {
                var angle = (i * 2.0 * Math.PI / tessellation);
                var dx = Math.sin(angle);
                var dz = Math.cos(angle);

                return new BABYLON.Vector3(dx, 0, dz);
            };

            var createCylinderCap = isTop => {
                var radius = isTop ? radiusTop : radiusBottom;

                if (radius == 0) {
                    return;
                }

                // Create cap indices.
                for (var i = 0; i < tessellation - 2; i++) {
                    var i1 = (i + 1) % tessellation;
                    var i2 = (i + 2) % tessellation;

                    if (!isTop) {
                        var tmp = i1;
                        i1 = i2;
                        i2 = tmp;
                    }

                    var vbase = positions.length / 3;
                    indices.push(vbase);
                    indices.push(vbase + i1);
                    indices.push(vbase + i2);
                }

                // Which end of the cylinder is this?
                var normal = new BABYLON.Vector3(0, -1, 0);
                var textureScale = new BABYLON.Vector2(-0.5, -0.5);

                if (!isTop) {
                    normal = normal.scale(-1);
                    textureScale.x = -textureScale.x;
                }

                // Create cap vertices.
                for (i = 0; i < tessellation; i++) {
                    var circleVector = getCircleVector(i);
                    var position = circleVector.scale(radius).add(normal.scale(height));
                    var textureCoordinate = new BABYLON.Vector2(circleVector.x * textureScale.x + 0.5, circleVector.z * textureScale.y + 0.5);

                    positions.push(position.x, position.y, position.z);
                    normals.push(normal.x, normal.y, normal.z);
                    uvs.push(textureCoordinate.x, textureCoordinate.y);
                }
            };

            height /= 2;

            var topOffset = new BABYLON.Vector3(0, 1, 0).scale(height);

            var stride = tessellation + 1;

            // Create a ring of triangles around the outside of the cylinder.
            for (var i = 0; i <= tessellation; i++) {
                var normal = getCircleVector(i);
                var sideOffsetBottom = normal.scale(radiusBottom);
                var sideOffsetTop = normal.scale(radiusTop);
                var textureCoordinate = new BABYLON.Vector2(i / tessellation, 0);

                var position = sideOffsetBottom.add(topOffset);
                positions.push(position.x, position.y, position.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(textureCoordinate.x, textureCoordinate.y);

                position = sideOffsetTop.subtract(topOffset);
                textureCoordinate.y += 1;
                positions.push(position.x, position.y, position.z);
                normals.push(normal.x, normal.y, normal.z);
                uvs.push(textureCoordinate.x, textureCoordinate.y);

                indices.push(i * 2);
                indices.push((i * 2 + 2) % (stride * 2));
                indices.push(i * 2 + 1);

                indices.push(i * 2 + 1);
                indices.push((i * 2 + 2) % (stride * 2));
                indices.push((i * 2 + 3) % (stride * 2));
            }

            // Create flat triangle fan caps to seal the top and bottom.
            createCylinderCap(true);
            createCylinderCap(false);

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        public static CreateTorus(diameter, thickness, tessellation) {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            diameter = diameter || 1;
            thickness = thickness || 0.5;
            tessellation = tessellation || 16;

            var stride = tessellation + 1;

            for (var i = 0; i <= tessellation; i++) {
                var u = i / tessellation;

                var outerAngle = i * Math.PI * 2.0 / tessellation - Math.PI / 2.0;

                var transform = BABYLON.Matrix.Translation(diameter / 2.0, 0, 0).multiply(BABYLON.Matrix.RotationY(outerAngle));

                for (var j = 0; j <= tessellation; j++) {
                    var v = 1 - j / tessellation;

                    var innerAngle = j * Math.PI * 2.0 / tessellation + Math.PI;
                    var dx = Math.cos(innerAngle);
                    var dy = Math.sin(innerAngle);

                    // Create a vertex.
                    var normal = new BABYLON.Vector3(dx, dy, 0);
                    var position = normal.scale(thickness / 2);
                    var textureCoordinate = new BABYLON.Vector2(u, v);

                    position = BABYLON.Vector3.TransformCoordinates(position, transform);
                    normal = BABYLON.Vector3.TransformNormal(normal, transform);

                    positions.push(position.x, position.y, position.z);
                    normals.push(normal.x, normal.y, normal.z);
                    uvs.push(textureCoordinate.x, textureCoordinate.y);

                    // And create indices for two triangles.
                    var nextI = (i + 1) % stride;
                    var nextJ = (j + 1) % stride;

                    indices.push(i * stride + j);
                    indices.push(i * stride + nextJ);
                    indices.push(nextI * stride + j);

                    indices.push(i * stride + nextJ);
                    indices.push(nextI * stride + nextJ);
                    indices.push(nextI * stride + j);
                }
            }

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        public static CreateGround(width: number, height: number, subdivisions: number): VertexData {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;

            width = width || 1;
            height = height || 1;
            subdivisions = subdivisions || 1;

            for (row = 0; row <= subdivisions; row++) {
                for (col = 0; col <= subdivisions; col++) {
                    var position = new BABYLON.Vector3((col * width) / subdivisions - (width / 2.0), 0, ((subdivisions - row) * height) / subdivisions - (height / 2.0));
                    var normal = new BABYLON.Vector3(0, 1.0, 0);

                    positions.push(position.x, position.y, position.z);
                    normals.push(normal.x, normal.y, normal.z);
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

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        public static CreateGroundFromHeightMap(width: number, height: number, subdivisions: number, minHeight: number, maxHeight: number, buffer: Uint8Array, bufferWidth:  number, bufferHeight: number): VertexData {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];
            var row, col;

            // Vertices
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

            // Indices
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
        }

        public static CreatePlane(size: number): VertexData {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            size = size || 1;

            // Vertices
            var halfSize = size / 2.0;
            positions.push(-halfSize, -halfSize, 0);
            normals.push(0, 0, -1.0);
            uvs.push(0.0, 0.0);

            positions.push(halfSize, -halfSize, 0);
            normals.push(0, 0, -1.0);
            uvs.push(1.0, 0.0);

            positions.push(halfSize, halfSize, 0);
            normals.push(0, 0, -1.0);
            uvs.push(1.0, 1.0);

            positions.push(-halfSize, halfSize, 0);
            normals.push(0, 0, -1.0);
            uvs.push(0.0, 1.0);

            // Indices
            indices.push(0);
            indices.push(1);
            indices.push(2);

            indices.push(0);
            indices.push(2);
            indices.push(3);

            // Result
            var vertexData = new BABYLON.VertexData();

            vertexData.indices = indices;
            vertexData.positions = positions;
            vertexData.normals = normals;
            vertexData.uvs = uvs;

            return vertexData;
        }

        // based on http://code.google.com/p/away3d/source/browse/trunk/fp10/Away3D/src/away3d/primitives/TorusKnot.as?spec=svn2473&r=2473
        public static CreateTorusKnot(radius: number, tube: number, radialSegments: number, tubularSegments: number, p: number, q: number): VertexData {
            var indices = [];
            var positions = [];
            var normals = [];
            var uvs = [];

            radius = radius || 2;
            tube = tube || 0.5;
            radialSegments = radialSegments || 32;
            tubularSegments = tubularSegments || 32;
            p = p || 2;
            q = q || 3;

            // Helper
            var getPos = (angle) => {

                var cu = Math.cos(angle);
                var su = Math.sin(angle);
                var quOverP = q / p * angle;
                var cs = Math.cos(quOverP);

                var tx = radius * (2 + cs) * 0.5 * cu;
                var ty = radius * (2 + cs) * su * 0.5;
                var tz = radius * Math.sin(quOverP) * 0.5;

                return new BABYLON.Vector3(tx, ty, tz);
            };

            // Vertices
            for (var i = 0; i <= radialSegments; i++) {
                var modI = i % radialSegments;
                var u = modI / radialSegments * 2 * p * Math.PI;
                var p1 = getPos(u);
                var p2 = getPos(u + 0.01);
                var tang = p2.subtract(p1);
                var n = p2.add(p1);

                var bitan = BABYLON.Vector3.Cross(tang, n);
                n = BABYLON.Vector3.Cross(bitan, tang);

                bitan.normalize();
                n.normalize();

                for (var j = 0; j < tubularSegments; j++) {
                    var modJ = j % tubularSegments;
                    var v = modJ / tubularSegments * 2 * Math.PI;
                    var cx = -tube * Math.cos(v);
                    var cy = tube * Math.sin(v);

                    positions.push(p1.x + cx * n.x + cy * bitan.x);
                    positions.push(p1.y + cx * n.y + cy * bitan.y);
                    positions.push(p1.z + cx * n.z + cy * bitan.z);

                    uvs.push(i / radialSegments);
                    uvs.push(j / tubularSegments);
                }
            }

            for (i = 0; i < radialSegments; i++) {
                for (j = 0; j < tubularSegments; j++) {
                    var jNext = (j + 1) % tubularSegments;
                    var a = i * tubularSegments + j;
                    var b = (i + 1) * tubularSegments + j;
                    var c = (i + 1) * tubularSegments + jNext;
                    var d = i * tubularSegments + jNext;

                    indices.push(d); indices.push(b); indices.push(a);
                    indices.push(d); indices.push(c); indices.push(b);
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
        }

        // Tools
        public static ComputeNormals(positions: number[], indices: number[], normals: number[]) {
            var positionVectors = [];
            var facesOfVertices = [];
            var index;

            for (index = 0; index < positions.length; index += 3) {
                var vector3 = new BABYLON.Vector3(positions[index], positions[index + 1], positions[index + 2]);
                positionVectors.push(vector3);
                facesOfVertices.push([]);
            }
            // Compute normals
            var facesNormals = [];
            for (index = 0; index < indices.length / 3; index++) {
                var i1 = indices[index * 3];
                var i2 = indices[index * 3 + 1];
                var i3 = indices[index * 3 + 2];

                var p1 = positionVectors[i1];
                var p2 = positionVectors[i2];
                var p3 = positionVectors[i3];

                var p1p2 = p1.subtract(p2);
                var p3p2 = p3.subtract(p2);

                facesNormals[index] = BABYLON.Vector3.Normalize(BABYLON.Vector3.Cross(p1p2, p3p2));
                facesOfVertices[i1].push(index);
                facesOfVertices[i2].push(index);
                facesOfVertices[i3].push(index);
            }

            for (index = 0; index < positionVectors.length; index++) {
                var faces = facesOfVertices[index];

                var normal = BABYLON.Vector3.Zero();
                for (var faceIndex = 0; faceIndex < faces.length; faceIndex++) {
                    normal.addInPlace(facesNormals[faces[faceIndex]]);
                }

                normal = BABYLON.Vector3.Normalize(normal.scale(1.0 / faces.length));

                normals[index * 3] = normal.x;
                normals[index * 3 + 1] = normal.y;
                normals[index * 3 + 2] = normal.z;
            }
        }
    }
} 