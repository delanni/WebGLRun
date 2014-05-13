﻿module BABYLON {
    export class BoundingBoxRenderer {
        public frontColor = new BABYLON.Color3(1, 1, 1);
        public backColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        public showBackLines = true;
        public renderList = new BABYLON.SmartArray(32);

        private _scene: Scene;
        private _colorShader: ShaderMaterial;
        private _vb: VertexBuffer;
        private _ib: WebGLBuffer;

        constructor(scene: Scene) {

            this._scene = scene;
            this._colorShader = new ShaderMaterial("colorShader", scene, "color",
                {
                    attributes: ["position"],
                    uniforms: ["worldViewProjection", "color"]
                });


            var engine = this._scene.getEngine();
            var boxdata = BABYLON.VertexData.CreateBox(1.0);
            this._vb = new BABYLON.VertexBuffer(null, boxdata.positions, BABYLON.VertexBuffer.PositionKind, false, engine);
            this._ib = engine.createIndexBuffer([0, 1, 1, 2, 2, 3, 3, 0, 4, 5, 5, 6, 6, 7, 7, 4, 0, 7, 1, 6, 2, 5, 3, 4]);
        }

        public reset(): void {
            this.renderList.reset();
        }

        public render(): void {
            if (this.renderList.length == 0 || !this._colorShader.isReady()) {
                return;
            }

            var engine = this._scene.getEngine();
            engine.setDepthWrite(false);
            this._colorShader._preBind();
            for (var boundingBoxIndex = 0; boundingBoxIndex < this.renderList.length; boundingBoxIndex++) {
                var mesh = this.renderList.data[boundingBoxIndex];
                var boundingBox = mesh.getBoundingInfo().boundingBox;
                var min = boundingBox.minimum;
                var max = boundingBox.maximum;
                var diff = max.subtract(min);
                var median = min.add(diff.scale(0.5));

                var worldMatrix = BABYLON.Matrix.Scaling(diff.x, diff.y, diff.z)
                    .multiply(BABYLON.Matrix.Translation(median.x, median.y, median.z))
                    .multiply(mesh.getWorldMatrix());

                // VBOs
                engine.bindBuffers(this._vb.getBuffer(), this._ib, [3], 3 * 4, this._colorShader.getEffect());

                if (this.showBackLines) {
                    // Back
                    engine.setDepthFunctionToGreaterOrEqual();
                    this._colorShader.setColor3("color", this.backColor);
                    this._colorShader.bind(worldMatrix, mesh);

                    // Draw order
                    engine.draw(false, 0, 24);
                }

                // Front
                engine.setDepthFunctionToLess();
                this._colorShader.setColor3("color", this.frontColor);
                this._colorShader.bind(worldMatrix, mesh);

                // Draw order
                engine.draw(false, 0, 24);
            }
            this._colorShader.unbind();
            engine.setDepthFunctionToLessOrEqual();
            engine.setDepthWrite(true);
        }

        public dispose(): void {
            this._colorShader.dispose();
            this._vb.dispose();
            this._scene.getEngine()._releaseBuffer(this._ib);
        }
    }
} 