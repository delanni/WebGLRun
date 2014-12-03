﻿module BABYLON {
    var randomNumber = (min: number, max: number): number => {
        if (min == max) {
            return (min);
        }

        var random = Math.random();

        return ((random * (max - min)) + min);
    }

    export class ParticleSystem {
        // Statics
        public static BLENDMODE_ONEONE = 0;
        public static BLENDMODE_STANDARD = 1;

        // Members
        public id: string;
        public renderingGroupId = 0;
        public emitter = null;
        public emitRate = 10;
        public manualEmitCount = -1;
        public updateSpeed = 0.01;
        public targetStopDuration = 0;
        public disposeOnStop = false;

        public minEmitPower = 1;
        public maxEmitPower = 1;

        public minLifeTime = 1;
        public maxLifeTime = 1;

        public minSize = 1;
        public maxSize = 1;
        public minAngularSpeed = 0;
        public maxAngularSpeed = 0;

        public particleTexture: Texture;

        public onDispose: () => void;

        public blendMode = BABYLON.ParticleSystem.BLENDMODE_ONEONE;

        public forceDepthWrite = false;

        public gravity = BABYLON.Vector3.Zero();
        public direction1 = new BABYLON.Vector3(0, 1.0, 0);
        public direction2 = new BABYLON.Vector3(0, 1.0, 0);
        public minEmitBox = new BABYLON.Vector3(-0.5, -0.5, -0.5);
        public maxEmitBox = new BABYLON.Vector3(0.5, 0.5, 0.5);
        public color1 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        public color2 = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        public colorDead = new BABYLON.Color4(0, 0, 0, 1.0);
        public textureMask = new BABYLON.Color4(1.0, 1.0, 1.0, 1.0);
        private particles = new Array<Particle>();

        private _capacity: number;
        private _scene: Scene;
        private _vertexDeclaration = [3, 4, 4];
        private _vertexStrideSize = 11 * 4; // 11 floats per particle (x, y, z, r, g, b, a, angle, size, offsetX, offsetY)
        private _stockParticles = new Array<Particle>();
        private _newPartsExcess = 0;
        private _vertexBuffer: WebGLBuffer;
        private _indexBuffer: WebGLBuffer;
        private _vertices: Float32Array;
        private _effect: Effect;
        private _cachedDefines: string;

        private _scaledColorStep = new BABYLON.Color4(0, 0, 0, 0);
        private _colorDiff = new BABYLON.Color4(0, 0, 0, 0);
        private _scaledDirection = BABYLON.Vector3.Zero();
        private _scaledGravity = BABYLON.Vector3.Zero();
        private _currentRenderId = -1;

        private _alive: boolean;
        private _started = true;
        private _stopped = false;
        private _actualFrame = 0;
        private _scaledUpdateSpeed: number;

        constructor(public name: string, capacity: number, scene: Scene) {
            this.id = name;
            this._capacity = capacity;

            this._scene = scene;

            scene.particleSystems.push(this);

            // VBO
            this._vertexBuffer = scene.getEngine().createDynamicVertexBuffer(capacity * this._vertexStrideSize * 4);

            var indices = [];
            var index = 0;
            for (var count = 0; count < capacity; count++) {
                indices.push(index);
                indices.push(index + 1);
                indices.push(index + 2);
                indices.push(index);
                indices.push(index + 2);
                indices.push(index + 3);
                index += 4;
            }

            this._indexBuffer = scene.getEngine().createIndexBuffer(indices);

            this._vertices = new Float32Array(capacity * this._vertexStrideSize);
        }

        public getCapacity(): number {
            return this._capacity;
        }

        public isAlive(): boolean {
            return this._alive;
        }

        public start(): void {
            this._started = true;
            this._stopped = false;
            this._actualFrame = 0;
        }

        public stop(): void {
            this._stopped = true;
        }

        public _appendParticleVertex(index: number, particle: Particle, offsetX: number, offsetY: number): void {
            var offset = index * 11;
            this._vertices[offset] = particle.position.x;
            this._vertices[offset + 1] = particle.position.y;
            this._vertices[offset + 2] = particle.position.z;
            this._vertices[offset + 3] = particle.color.r;
            this._vertices[offset + 4] = particle.color.g;
            this._vertices[offset + 5] = particle.color.b;
            this._vertices[offset + 6] = particle.color.a;
            this._vertices[offset + 7] = particle.angle;
            this._vertices[offset + 8] = particle.size;
            this._vertices[offset + 9] = offsetX;
            this._vertices[offset + 10] = offsetY;
        }

        private _update(newParticles: number): void {
            // Update current
            this._alive = this.particles.length > 0;
            for (var index = 0; index < this.particles.length; index++) {
                var particle = this.particles[index];
                particle.age += this._scaledUpdateSpeed;

                if (particle.age >= particle.lifeTime) {
                    this._stockParticles.push(this.particles.splice(index, 1)[0]);
                    index--;
                    continue;
                }
                else {
                    particle.colorStep.scaleToRef(this._scaledUpdateSpeed, this._scaledColorStep);
                    particle.color.addInPlace(this._scaledColorStep);

                    if (particle.color.a < 0)
                        particle.color.a = 0;

                    particle.direction.scaleToRef(this._scaledUpdateSpeed, this._scaledDirection);
                    particle.position.addInPlace(this._scaledDirection);

                    particle.angle += particle.angularSpeed * this._scaledUpdateSpeed;

                    this.gravity.scaleToRef(this._scaledUpdateSpeed, this._scaledGravity);
                    particle.direction.addInPlace(this._scaledGravity);
                }
            }

            // Add new ones
            var worldMatrix;

            if (this.emitter.position) {
                worldMatrix = this.emitter.getWorldMatrix();
            } else {
                worldMatrix = BABYLON.Matrix.Translation(this.emitter.x, this.emitter.y, this.emitter.z);
            }

            for (index = 0; index < newParticles; index++) {
                if (this.particles.length == this._capacity) {
                    break;
                }

                if (this._stockParticles.length !== 0) {
                    particle = this._stockParticles.pop();
                    particle.age = 0;
                } else {
                    particle = new BABYLON.Particle();
                }
                this.particles.push(particle);

                var emitPower = randomNumber(this.minEmitPower, this.maxEmitPower);

                var randX = randomNumber(this.direction1.x, this.direction2.x);
                var randY = randomNumber(this.direction1.y, this.direction2.y);
                var randZ = randomNumber(this.direction1.z, this.direction2.z);

                BABYLON.Vector3.TransformNormalFromFloatsToRef(randX * emitPower, randY * emitPower, randZ * emitPower, worldMatrix, particle.direction);

                particle.lifeTime = randomNumber(this.minLifeTime, this.maxLifeTime);

                particle.size = randomNumber(this.minSize, this.maxSize);
                particle.angularSpeed = randomNumber(this.minAngularSpeed, this.maxAngularSpeed);

                randX = randomNumber(this.minEmitBox.x, this.maxEmitBox.x);
                randY = randomNumber(this.minEmitBox.y, this.maxEmitBox.y);
                randZ = randomNumber(this.minEmitBox.z, this.maxEmitBox.z);

                BABYLON.Vector3.TransformCoordinatesFromFloatsToRef(randX, randY, randZ, worldMatrix, particle.position);

                var step = randomNumber(0, 1.0);

                BABYLON.Color4.LerpToRef(this.color1, this.color2, step, particle.color);

                this.colorDead.subtractToRef(particle.color, this._colorDiff);
                this._colorDiff.scaleToRef(1.0 / particle.lifeTime, particle.colorStep);
            }
        }

        private _getEffect(): Effect {
            var defines = [];

            if (this._scene.clipPlane) {
                defines.push("#define CLIPPLANE");
            }

            // Effect
            var join = defines.join("\n");
            if (this._cachedDefines != join) {
                this._cachedDefines = join;
                this._effect = this._scene.getEngine().createEffect("particles",
                    ["position", "color", "options"],
                    ["invView", "view", "projection", "vClipPlane", "textureMask"],
                    ["diffuseSampler"], join);
            }

            return this._effect;
        }

        public animate(): void {
            if (!this._started)
                return;

            var effect = this._getEffect();

            // Check
            if (!this.emitter || !effect.isReady() || !this.particleTexture || !this.particleTexture.isReady())
                return;

            if (this._currentRenderId === this._scene.getRenderId()) {
                return;
            }

            this._currentRenderId = this._scene.getRenderId();

            this._scaledUpdateSpeed = this.updateSpeed * this._scene.getAnimationRatio();

            // determine the number of particles we need to create   
            var emitCout;

            if (this.manualEmitCount > -1) {
                emitCout = this.manualEmitCount;
                this.manualEmitCount = 0;
            } else {
                emitCout = this.emitRate;
            }

            var newParticles = ((emitCout * this._scaledUpdateSpeed) >> 0);
            this._newPartsExcess += emitCout * this._scaledUpdateSpeed - newParticles;

            if (this._newPartsExcess > 1.0) {
                newParticles += this._newPartsExcess >> 0;
                this._newPartsExcess -= this._newPartsExcess >> 0;
            }

            this._alive = false;

            if (!this._stopped) {
                this._actualFrame += this._scaledUpdateSpeed;

                if (this.targetStopDuration && this._actualFrame >= this.targetStopDuration)
                    this.stop();
            } else {
                newParticles = 0;
            }

            this._update(newParticles);

            // Stopped?
            if (this._stopped) {
                if (!this._alive) {
                    this._started = false;
                    if (this.disposeOnStop) {
                        this._scene._toBeDisposed.push(this);
                    }
                }
            }

            // Update VBO
            var offset = 0;
            for (var index = 0; index < this.particles.length; index++) {
                var particle = this.particles[index];

                this._appendParticleVertex(offset++, particle, 0, 0);
                this._appendParticleVertex(offset++, particle, 1, 0);
                this._appendParticleVertex(offset++, particle, 1, 1);
                this._appendParticleVertex(offset++, particle, 0, 1);
            }
            var engine = this._scene.getEngine();
            engine.updateDynamicVertexBuffer(this._vertexBuffer, this._vertices, this.particles.length * this._vertexStrideSize);
        }

        public render(): number {
            var effect = this._getEffect();

            // Check
            if (!this.emitter || !effect.isReady() || !this.particleTexture || !this.particleTexture.isReady() || !this.particles.length)
                return 0;

            var engine = this._scene.getEngine();

            // Render
            engine.enableEffect(effect);

            var viewMatrix = this._scene.getViewMatrix();
            effect.setTexture("diffuseSampler", this.particleTexture);
            effect.setMatrix("view", viewMatrix);
            effect.setMatrix("projection", this._scene.getProjectionMatrix());
            effect.setFloat4("textureMask", this.textureMask.r, this.textureMask.g, this.textureMask.b, this.textureMask.a);

            if (this._scene.clipPlane) {
                var clipPlane = this._scene.clipPlane;
                var invView = viewMatrix.clone();
                invView.invert();
                effect.setMatrix("invView", invView);
                effect.setFloat4("vClipPlane", clipPlane.normal.x, clipPlane.normal.y, clipPlane.normal.z, clipPlane.d);
            }

            // VBOs
            engine.bindBuffers(this._vertexBuffer, this._indexBuffer, this._vertexDeclaration, this._vertexStrideSize, effect);

            // Draw order
            if (this.blendMode === BABYLON.ParticleSystem.BLENDMODE_ONEONE) {
                engine.setAlphaMode(BABYLON.Engine.ALPHA_ADD);
            } else {
                engine.setAlphaMode(BABYLON.Engine.ALPHA_COMBINE);
            }

            if (this.forceDepthWrite) {
                engine.setDepthWrite(true);
            }

            engine.draw(true, 0, this.particles.length * 6);
            engine.setAlphaMode(BABYLON.Engine.ALPHA_DISABLE);

            return this.particles.length;
        }

        public dispose(): void {
            if (this._vertexBuffer) {
                this._scene.getEngine()._releaseBuffer(this._vertexBuffer);
                this._vertexBuffer = null;
            }

            if (this._indexBuffer) {
                this._scene.getEngine()._releaseBuffer(this._indexBuffer);
                this._indexBuffer = null;
            }

            if (this.particleTexture) {
                this.particleTexture.dispose();
                this.particleTexture = null;
            }

            // Remove from scene
            var index = this._scene.particleSystems.indexOf(this);
            this._scene.particleSystems.splice(index, 1);

            // Callback
            if (this.onDispose) {
                this.onDispose();
            }
        }

        // Clone
        public clone(name: string, newEmitter: any): ParticleSystem {
            var result = new BABYLON.ParticleSystem(name, this._capacity, this._scene);

            BABYLON.Tools.DeepCopy(this, result, ["particles"], ["_vertexDeclaration", "_vertexStrideSize"]);

            if (newEmitter === undefined) {
                newEmitter = this.emitter;
            }

            result.emitter = newEmitter;
            if (this.particleTexture) {
                result.particleTexture = new BABYLON.Texture(this.particleTexture.url, this._scene);
            }

            result.start();

            return result;
        }
    }
}  