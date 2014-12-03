﻿module BABYLON {
    var compileShader = (gl: WebGLRenderingContext, source: string, type: string, defines: string): WebGLShader => {
        var shader = gl.createShader(type === "vertex" ? gl.VERTEX_SHADER : gl.FRAGMENT_SHADER);

        gl.shaderSource(shader, (defines ? defines + "\n" : "") + source);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            throw new Error(gl.getShaderInfoLog(shader));
        }
        return shader;
    };

    var getExponantOfTwo = (value: number, max: number): number => {
        var count = 1;

        do {
            count *= 2;
        } while (count < value);

        if (count > max)
            count = max;

        return count;
    };

    var prepareWebGLTexture = (texture: WebGLTexture, gl: WebGLRenderingContext, scene: Scene, width: number, height: number, invertY: boolean, noMipmap: boolean, isCompressed: boolean,
        processFunction: (width: number, height: number) => void) => {
        var engine = scene.getEngine();
        var potWidth = getExponantOfTwo(width, engine.getCaps().maxTextureSize);
        var potHeight = getExponantOfTwo(height, engine.getCaps().maxTextureSize);

        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, invertY === undefined ? 1 : (invertY ? 1 : 0));

        processFunction(potWidth, potHeight);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

        if (noMipmap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

            if (!isCompressed) {
                gl.generateMipmap(gl.TEXTURE_2D);
            }
        }
        gl.bindTexture(gl.TEXTURE_2D, null);

        engine._activeTexturesCache = [];
        texture._baseWidth = width;
        texture._baseHeight = height;
        texture._width = potWidth;
        texture._height = potHeight;
        texture.isReady = true;
        scene._removePendingData(texture);
    };

    // ANY
    var cascadeLoad = (rootUrl: string, index: number, loadedImages: HTMLImageElement[], scene,
        onfinish: (images: HTMLImageElement[]) => void, extensions: string[]) => {
        var img: HTMLImageElement;

        var onload = () => {
            loadedImages.push(img);

            scene._removePendingData(img);

            if (index != extensions.length - 1) {
                cascadeLoad(rootUrl, index + 1, loadedImages, scene, onfinish, extensions);
            } else {
                onfinish(loadedImages);
            }
        };

        var onerror = () => {
            scene._removePendingData(img);
        };

        img = BABYLON.Tools.LoadImage(rootUrl + extensions[index], onload, onerror, scene.database);
        scene._addPendingData(img);
    };

    export class EngineCapabilities {
        public maxTexturesImageUnits: number;
        public maxTextureSize: number;
        public maxCubemapTextureSize: number;
        public maxRenderTextureSize: number;
        public standardDerivatives: boolean;
        public s3tc;
        public textureFloat: boolean;
        public textureAnisotropicFilterExtension;
        public maxAnisotropy: number;
    }

    export class Engine {
        // Statics
        public static ShadersRepository = "Babylon/Shaders/";

        public static ALPHA_DISABLE = 0;
        public static ALPHA_ADD = 1;
        public static ALPHA_COMBINE = 2;

        public static DELAYLOADSTATE_NONE = 0;
        public static DELAYLOADSTATE_LOADED = 1;
        public static DELAYLOADSTATE_LOADING = 2;
        public static DELAYLOADSTATE_NOTLOADED = 4;

        public static Epsilon = 0.001;
        public static CollisionsEpsilon = 0.001;

        // Public members
        public isFullscreen = false;
        public isPointerLock = false;
        public forceWireframe = false;
        public cullBackFaces = true;
        public renderEvenInBackground = true;
        public scenes = new Array<Scene>();

        // Private Members
        private _gl: WebGLRenderingContext;
        private _renderingCanvas: HTMLCanvasElement;
        private _windowIsBackground = false;

        private _onBlur: () => void;
        private _onFocus: () => void;
        private _onFullscreenChange: () => void;
        private _onPointerLockChange: () => void;

        private _hardwareScalingLevel: number;
        private _caps: EngineCapabilities;
        private _pointerLockRequested: boolean;
        private _alphaTest: boolean;

        private _runningLoop = false;
        private _renderFunction: () => void;

        // Cache
        private _loadedTexturesCache = new Array<WebGLTexture>();
        public _activeTexturesCache = new Array<Texture>();
        private _currentEffect: Effect;
        private _cullingState: boolean;
        private _compiledEffects = {};
        private _lastVertexAttribIndex = 0;
        private _depthMask = false;
        private _cachedViewport: Viewport;
        private _cachedVertexBuffers: any;
        private _cachedIndexBuffer: WebGLBuffer;
        private _cachedEffectForVertexBuffers: Effect;
        private _currentRenderTarget: WebGLTexture;

        private _workingCanvas: HTMLCanvasElement;
        private _workingContext: CanvasRenderingContext2D;

        constructor(canvas: HTMLCanvasElement, antialias?: boolean, options?) {
            this._renderingCanvas = canvas;

            options = options || {};
            options.antialias = antialias;

            // GL
            try {
                this._gl = canvas.getContext("webgl", options) || canvas.getContext("experimental-webgl", options);
            } catch (e) {
                throw new Error("WebGL not supported");
            }

            if (!this._gl) {
                throw new Error("WebGL not supported");
            }

            this._onBlur = () => {
                this._windowIsBackground = true;
            };

            this._onFocus = () => {
                this._windowIsBackground = false;
            };

            window.addEventListener("blur", this._onBlur);
            window.addEventListener("focus", this._onFocus);


            // Textures
            this._workingCanvas = document.createElement("canvas");
            this._workingContext = this._workingCanvas.getContext("2d");

            // Viewport
            this._hardwareScalingLevel = 1.0 / (window.devicePixelRatio || 1.0);
            this.resize();

            // Caps
            this._caps = new EngineCapabilities();
            this._caps.maxTexturesImageUnits = this._gl.getParameter(this._gl.MAX_TEXTURE_IMAGE_UNITS);
            this._caps.maxTextureSize = this._gl.getParameter(this._gl.MAX_TEXTURE_SIZE);
            this._caps.maxCubemapTextureSize = this._gl.getParameter(this._gl.MAX_CUBE_MAP_TEXTURE_SIZE);
            this._caps.maxRenderTextureSize = this._gl.getParameter(this._gl.MAX_RENDERBUFFER_SIZE);

            // Extensions
            this._caps.standardDerivatives = (this._gl.getExtension('OES_standard_derivatives') !== null);
            this._caps.s3tc = this._gl.getExtension('WEBGL_compressed_texture_s3tc');
            this._caps.textureFloat = (this._gl.getExtension('OES_texture_float') !== null);
            this._caps.textureAnisotropicFilterExtension = this._gl.getExtension('EXT_texture_filter_anisotropic') || this._gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic') || this._gl.getExtension('MOZ_EXT_texture_filter_anisotropic');
            this._caps.maxAnisotropy = this._caps.textureAnisotropicFilterExtension ? this._gl.getParameter(this._caps.textureAnisotropicFilterExtension.MAX_TEXTURE_MAX_ANISOTROPY_EXT) : 0;

            // Depth buffer
            this.setDepthBuffer(true);
            this.setDepthFunctionToLessOrEqual();
            this.setDepthWrite(true);

            // Fullscreen
            this._onFullscreenChange = () => {
                if (document.fullscreen !== undefined) {
                    this.isFullscreen = document.fullscreen;
                } else if (document.mozFullScreen !== undefined) {
                    this.isFullscreen = document.mozFullScreen;
                } else if (document.webkitIsFullScreen !== undefined) {
                    this.isFullscreen = document.webkitIsFullScreen;
                } else if (document.msIsFullScreen !== undefined) {
                    this.isFullscreen = document.msIsFullScreen;
                }

                // Pointer lock
                if (this.isFullscreen && this._pointerLockRequested) {
                    canvas.requestPointerLock = canvas.requestPointerLock ||
                    canvas.msRequestPointerLock ||
                    canvas.mozRequestPointerLock ||
                    canvas.webkitRequestPointerLock;

                    if (canvas.requestPointerLock) {
                        canvas.requestPointerLock();
                    }
                }
            };

            document.addEventListener("fullscreenchange", this._onFullscreenChange, false);
            document.addEventListener("mozfullscreenchange", this._onFullscreenChange, false);
            document.addEventListener("webkitfullscreenchange", this._onFullscreenChange, false);
            document.addEventListener("msfullscreenchange", this._onFullscreenChange, false);

            // Pointer lock
            this._onPointerLockChange = () => {
                this.isPointerLock = (document.mozPointerLockElement === canvas ||
                document.webkitPointerLockElement === canvas ||
                document.msPointerLockElement === canvas ||
                document.pointerLockElement === canvas
                );
            };

            document.addEventListener("pointerlockchange", this._onPointerLockChange, false);
            document.addEventListener("mspointerlockchange", this._onPointerLockChange, false);
            document.addEventListener("mozpointerlockchange", this._onPointerLockChange, false);
            document.addEventListener("webkitpointerlockchange", this._onPointerLockChange, false);
        }


        public getAspectRatio(camera: Camera): number {
            var viewport = camera.viewport;
            return (this.getRenderWidth() * viewport.width) / (this.getRenderHeight() * viewport.height);
        }

        public getRenderWidth(): number {
            if (this._currentRenderTarget) {
                return this._currentRenderTarget._width;
            }

            return this._renderingCanvas.width;
        }

        public getRenderHeight(): number {
            if (this._currentRenderTarget) {
                return this._currentRenderTarget._height;
            }

            return this._renderingCanvas.height;
        }

        public getRenderingCanvas(): HTMLCanvasElement {
            return this._renderingCanvas;
        }

        public setHardwareScalingLevel(level: number): void {
            this._hardwareScalingLevel = level;
            this.resize();
        }

        public getHardwareScalingLevel(): number {
            return this._hardwareScalingLevel;
        }

        public getLoadedTexturesCache(): WebGLTexture[] {
            return this._loadedTexturesCache;
        }

        public getCaps(): EngineCapabilities {
            return this._caps;
        }

        // Methods
        public setDepthFunctionToGreater(): void {
            this._gl.depthFunc(this._gl.GREATER);
        }

        public setDepthFunctionToGreaterOrEqual(): void {
            this._gl.depthFunc(this._gl.GEQUAL);
        }

        public setDepthFunctionToLess(): void {
            this._gl.depthFunc(this._gl.LESS);
        }

        public setDepthFunctionToLessOrEqual(): void {
            this._gl.depthFunc(this._gl.LEQUAL);
        }

        public stopRenderLoop(): void {
            this._renderFunction = null;
            this._runningLoop = false;
        }

        public _renderLoop(): void {
            var shouldRender = true;
            if (!this.renderEvenInBackground && this._windowIsBackground) {
                shouldRender = false;
            }

            if (shouldRender) {
                // Start new frame
                this.beginFrame();

                if (this._renderFunction) {
                    this._renderFunction();
                }

                // Present
                this.endFrame();
            }

            if (this._runningLoop) {
                // Register new frame
                BABYLON.Tools.QueueNewFrame(() => {
                    this._renderLoop();
                });
            }
        }

        public runRenderLoop(renderFunction: () => void): void {
            this._runningLoop = true;

            this._renderFunction = renderFunction;

            BABYLON.Tools.QueueNewFrame(() => {
                this._renderLoop();
            });
        }

        public switchFullscreen(requestPointerLock: boolean): void {
            if (this.isFullscreen) {
                BABYLON.Tools.ExitFullscreen();
            } else {
                this._pointerLockRequested = requestPointerLock;
                BABYLON.Tools.RequestFullscreen(this._renderingCanvas);
            }
        }

        public clear(color: any, backBuffer: boolean, depthStencil: boolean): void {
            this._gl.clearColor(color.r, color.g, color.b, color.a !== undefined ? color.a : 1.0);
            if (this._depthMask) {
                this._gl.clearDepth(1.0);
            }
            var mode = 0;

            if (backBuffer)
                mode |= this._gl.COLOR_BUFFER_BIT;

            if (depthStencil && this._depthMask)
                mode |= this._gl.DEPTH_BUFFER_BIT;

            this._gl.clear(mode);
        }

        public setViewport(viewport: Viewport, requiredWidth?: number, requiredHeight?: number): void {
            var width = requiredWidth || this._renderingCanvas.width;
            var height = requiredHeight || this._renderingCanvas.height;
            var x = viewport.x || 0;
            var y = viewport.y || 0;

            this._cachedViewport = viewport;

            this._gl.viewport(x * width, y * height, width * viewport.width, height * viewport.height);
        }

        public setDirectViewport(x: number, y: number, width: number, height: number): void {
            this._cachedViewport = null;

            this._gl.viewport(x, y, width, height);
        }

        public beginFrame(): void {
            BABYLON.Tools._MeasureFps();
        }

        public endFrame(): void {
            this.flushFramebuffer();
        }

        public resize(): void {
            this._renderingCanvas.width = this._renderingCanvas.clientWidth / this._hardwareScalingLevel;
            this._renderingCanvas.height = this._renderingCanvas.clientHeight / this._hardwareScalingLevel;
        }

        public bindFramebuffer(texture: WebGLTexture): void {
            this._currentRenderTarget = texture;

            var gl = this._gl;
            gl.bindFramebuffer(gl.FRAMEBUFFER, texture._framebuffer);
            this._gl.viewport(0, 0, texture._width, texture._height);

            this.wipeCaches();
        }

        public unBindFramebuffer(texture: WebGLTexture): void {
            this._currentRenderTarget = null;
            if (texture.generateMipMaps) {
                var gl = this._gl;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.generateMipmap(gl.TEXTURE_2D);
                gl.bindTexture(gl.TEXTURE_2D, null);
            }

            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);
        }

        public flushFramebuffer(): void {
            this._gl.flush();
        }

        public restoreDefaultFramebuffer(): void {
            this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, null);

            this.setViewport(this._cachedViewport);

            this.wipeCaches();
        }

        // VBOs
        public createVertexBuffer(vertices: number[]): WebGLBuffer {
            var vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, new Float32Array(vertices), this._gl.STATIC_DRAW);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
            vbo.references = 1;
            return vbo;
        }

        public createDynamicVertexBuffer(capacity: number): WebGLBuffer {
            var vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vbo);
            this._gl.bufferData(this._gl.ARRAY_BUFFER, capacity, this._gl.DYNAMIC_DRAW);
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
            vbo.references = 1;
            return vbo;
        }

        public updateDynamicVertexBuffer(vertexBuffer: WebGLBuffer, vertices: any, length?: number): void {
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);
            if (length && length != vertices.length) {
                this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, new Float32Array(vertices, 0, length));
            } else {
                if (vertices instanceof Float32Array) {
                    this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, vertices);
                } else {
                    this._gl.bufferSubData(this._gl.ARRAY_BUFFER, 0, new Float32Array(vertices));
                }
            }

            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, null);
        }

        public createIndexBuffer(indices: number[]): WebGLBuffer {
            var vbo = this._gl.createBuffer();
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, vbo);
            this._gl.bufferData(this._gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), this._gl.STATIC_DRAW);
            this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, null);
            vbo.references = 1;
            return vbo;
        }

        public bindBuffers(vertexBuffer: WebGLBuffer, indexBuffer: WebGLBuffer, vertexDeclaration: number[], vertexStrideSize: number, effect: Effect): void {
            if (this._cachedVertexBuffers !== vertexBuffer || this._cachedEffectForVertexBuffers !== effect) {
                this._cachedVertexBuffers = vertexBuffer;
                this._cachedEffectForVertexBuffers = effect;

                this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer);

                var offset = 0;
                for (var index = 0; index < vertexDeclaration.length; index++) {
                    var order = effect.getAttribute(index);

                    if (order >= 0) {
                        this._gl.vertexAttribPointer(order, vertexDeclaration[index], this._gl.FLOAT, false, vertexStrideSize, offset);
                    }
                    offset += vertexDeclaration[index] * 4;
                }
            }

            if (this._cachedIndexBuffer !== indexBuffer) {
                this._cachedIndexBuffer = indexBuffer;
                this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            }
        }

        public bindMultiBuffers(vertexBuffers: VertexBuffer[], indexBuffer: WebGLBuffer, effect: Effect): void {
            if (this._cachedVertexBuffers !== vertexBuffers || this._cachedEffectForVertexBuffers !== effect) {
                this._cachedVertexBuffers = vertexBuffers;
                this._cachedEffectForVertexBuffers = effect;

                var attributes = effect.getAttributesNames();

                for (var index = 0; index < attributes.length; index++) {
                    var order = effect.getAttribute(index);

                    if (order >= 0) {
                        var vertexBuffer = vertexBuffers[attributes[index]];
                        var stride = vertexBuffer.getStrideSize();
                        this._gl.bindBuffer(this._gl.ARRAY_BUFFER, vertexBuffer.getBuffer());
                        this._gl.vertexAttribPointer(order, stride, this._gl.FLOAT, false, stride * 4, 0);
                    }
                }
            }

            if (this._cachedIndexBuffer !== indexBuffer) {
                this._cachedIndexBuffer = indexBuffer;
                this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            }
        }

        public _releaseBuffer(buffer: WebGLBuffer): void {
            buffer.references--;

            if (buffer.references === 0) {
                this._gl.deleteBuffer(buffer);
            }
        }

        public draw(useTriangles: boolean, indexStart: number, indexCount: number): void {
            this._gl.drawElements(useTriangles ? this._gl.TRIANGLES : this._gl.LINES, indexCount, this._gl.UNSIGNED_SHORT, indexStart * 2);
        }

        // Shaders
        public _releaseEffect(effect: Effect): void {
            if (this._compiledEffects[effect._key]) {
                delete this._compiledEffects[effect._key];
                if (effect.getProgram()) {
                    this._gl.deleteProgram(effect.getProgram());
                }
            }
        }

        public createEffect(baseName: any, attributesNames: string[], uniformsNames: string[], samplers: string[], defines: string, optionalDefines?: string[],
            onCompiled?: (effect: Effect) => void, onError?: (effect: Effect, errors: string) => void): Effect {
            var vertex = baseName.vertexElement || baseName.vertex || baseName;
            var fragment = baseName.fragmentElement || baseName.fragment || baseName;

            var name = vertex + "+" + fragment + "@" + defines;
            if (this._compiledEffects[name]) {
                return this._compiledEffects[name];
            }

            var effect = new BABYLON.Effect(baseName, attributesNames, uniformsNames, samplers, this, defines, optionalDefines, onCompiled, onError);
            effect._key = name;
            this._compiledEffects[name] = effect;

            return effect;
        }

        public createShaderProgram(vertexCode: string, fragmentCode: string, defines: string): WebGLProgram {
            var vertexShader = compileShader(this._gl, vertexCode, "vertex", defines);
            var fragmentShader = compileShader(this._gl, fragmentCode, "fragment", defines);

            var shaderProgram = this._gl.createProgram();
            this._gl.attachShader(shaderProgram, vertexShader);
            this._gl.attachShader(shaderProgram, fragmentShader);

            var linked = this._gl.linkProgram(shaderProgram);
            if (!linked) {
                var error = this._gl.getProgramInfoLog(shaderProgram);
                if (error) {
                    throw new Error(error);
                }
            }

            this._gl.deleteShader(vertexShader);
            this._gl.deleteShader(fragmentShader);

            return shaderProgram;
        }

        public getUniforms(shaderProgram: WebGLProgram, uniformsNames: string[]): WebGLUniformLocation[] {
            var results = [];

            for (var index = 0; index < uniformsNames.length; index++) {
                results.push(this._gl.getUniformLocation(shaderProgram, uniformsNames[index]));
            }

            return results;
        }

        public getAttributes(shaderProgram: WebGLProgram, attributesNames: string[]): number[] {
            var results = [];

            for (var index = 0; index < attributesNames.length; index++) {
                try {
                    results.push(this._gl.getAttribLocation(shaderProgram, attributesNames[index]));
                } catch (e) {
                    results.push(-1);
                }
            }

            return results;
        }

        public enableEffect(effect: Effect): void {
            if (!effect || !effect.getAttributesCount() || this._currentEffect === effect) {
                return;
            }
            // Use program
            this._gl.useProgram(effect.getProgram());

            var currentCount = effect.getAttributesCount();
            var maxIndex = 0;
            for (var index = 0; index < currentCount; index++) {
                // Attributes
                var order = effect.getAttribute(index);

                if (order >= 0) {
                    this._gl.enableVertexAttribArray(effect.getAttribute(index));
                    maxIndex = Math.max(maxIndex, order);
                }
            }

            for (index = maxIndex + 1; index <= this._lastVertexAttribIndex; index++) {
                this._gl.disableVertexAttribArray(index);
            }

            this._lastVertexAttribIndex = maxIndex;
            this._currentEffect = effect;
        }

        public setArray(uniform: WebGLUniformLocation, array: number[]): void {
            if (!uniform)
                return;

            this._gl.uniform1fv(uniform, array);
        }

        public setMatrices(uniform: WebGLUniformLocation, matrices: Float32Array): void {
            if (!uniform)
                return;

            this._gl.uniformMatrix4fv(uniform, false, matrices);
        }

        public setMatrix(uniform: WebGLUniformLocation, matrix: Matrix): void {
            if (!uniform)
                return;

            this._gl.uniformMatrix4fv(uniform, false, matrix.toArray());
        }

        public setFloat(uniform: WebGLUniformLocation, value: number): void {
            if (!uniform)
                return;

            this._gl.uniform1f(uniform, value);
        }

        public setFloat2(uniform: WebGLUniformLocation, x: number, y: number): void {
            if (!uniform)
                return;

            this._gl.uniform2f(uniform, x, y);
        }

        public setFloat3(uniform: WebGLUniformLocation, x: number, y: number, z: number): void {
            if (!uniform)
                return;

            this._gl.uniform3f(uniform, x, y, z);
        }

        public setBool(uniform: WebGLUniformLocation, bool: number): void {
            if (!uniform)
                return;

            this._gl.uniform1i(uniform, bool);
        }

        public setFloat4(uniform: WebGLUniformLocation, x: number, y: number, z: number, w: number): void {
            if (!uniform)
                return;

            this._gl.uniform4f(uniform, x, y, z, w);
        }

        public setColor3(uniform: WebGLUniformLocation, color3: Color3): void {
            if (!uniform)
                return;

            this._gl.uniform3f(uniform, color3.r, color3.g, color3.b);
        }

        public setColor4(uniform: WebGLUniformLocation, color3: Color3, alpha: number): void {
            if (!uniform)
                return;

            this._gl.uniform4f(uniform, color3.r, color3.g, color3.b, alpha);
        }

        // States
        public setState(culling: boolean): void {
            // Culling        
            if (this._cullingState !== culling) {
                if (culling) {
                    this._gl.cullFace(this.cullBackFaces ? this._gl.BACK : this._gl.FRONT);
                    this._gl.enable(this._gl.CULL_FACE);
                } else {
                    this._gl.disable(this._gl.CULL_FACE);
                }

                this._cullingState = culling;
            }
        }

        public setDepthBuffer(enable: boolean): void {
            if (enable) {
                this._gl.enable(this._gl.DEPTH_TEST);
            } else {
                this._gl.disable(this._gl.DEPTH_TEST);
            }
        }

        public setDepthWrite(enable: boolean): void {
            this._gl.depthMask(enable);
            this._depthMask = enable;
        }

        public setColorWrite(enable: boolean): void {
            this._gl.colorMask(enable, enable, enable, enable);
        }

        public setAlphaMode(mode: number): void {

            switch (mode) {
                case BABYLON.Engine.ALPHA_DISABLE:
                    this.setDepthWrite(true);
                    this._gl.disable(this._gl.BLEND);
                    break;
                case BABYLON.Engine.ALPHA_COMBINE:
                    this.setDepthWrite(false);
                    this._gl.blendFuncSeparate(this._gl.SRC_ALPHA, this._gl.ONE_MINUS_SRC_ALPHA, this._gl.ONE, this._gl.ONE);
                    this._gl.enable(this._gl.BLEND);
                    break;
                case BABYLON.Engine.ALPHA_ADD:
                    this.setDepthWrite(false);
                    this._gl.blendFuncSeparate(this._gl.ONE, this._gl.ONE, this._gl.ZERO, this._gl.ONE);
                    this._gl.enable(this._gl.BLEND);
                    break;
            }
        }

        public setAlphaTesting(enable: boolean): void {
            this._alphaTest = enable;
        }

        public getAlphaTesting(): boolean {
            return this._alphaTest;
        }

        // Textures
        public wipeCaches(): void {
            this._activeTexturesCache = [];
            this._currentEffect = null;
            this._cullingState = null;

            this._cachedVertexBuffers = null;
            this._cachedIndexBuffer = null;
            this._cachedEffectForVertexBuffers = null;
        }

        public createTexture(url: string, noMipmap: boolean, invertY: boolean, scene: Scene): WebGLTexture {
            var texture = this._gl.createTexture();
            var isDDS = this.getCaps().s3tc && (url.substr(url.length - 4, 4).toLowerCase() === ".dds");

            scene._addPendingData(texture);
            texture.url = url;
            texture.noMipmap = noMipmap;
            texture.references = 1;
            this._loadedTexturesCache.push(texture);

            if (isDDS) {
                BABYLON.Tools.LoadFile(url, data => {
                    var info = BABYLON.Internals.DDSTools.GetDDSInfo(data);

                    var loadMipmap = info.mipmapCount > 1 && !noMipmap;

                    prepareWebGLTexture(texture, this._gl, scene, info.width, info.height, invertY, !loadMipmap, true, () => {
                        BABYLON.Internals.DDSTools.UploadDDSLevels(this._gl, this.getCaps().s3tc, data, loadMipmap);
                    });
                }, null, scene.database, true);
            } else {
                var onload = (img) => {
                    prepareWebGLTexture(texture, this._gl, scene, img.width, img.height, invertY, noMipmap, false, (potWidth, potHeight) => {
                        var isPot = (img.width == potWidth && img.height == potHeight);
                        if (!isPot) {
                            this._workingCanvas.width = potWidth;
                            this._workingCanvas.height = potHeight;

                            this._workingContext.drawImage(img, 0, 0, img.width, img.height, 0, 0, potWidth, potHeight);
                        }

                        this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, isPot ? img : this._workingCanvas);

                    });
                };

                var onerror = () => {
                    scene._removePendingData(texture);
                };

                BABYLON.Tools.LoadImage(url, onload, onerror, scene.database);
            }

            return texture;
        }

        public createDynamicTexture(width: number, height: number, generateMipMaps: boolean): WebGLTexture {
            var texture = this._gl.createTexture();

            width = getExponantOfTwo(width, this._caps.maxTextureSize);
            height = getExponantOfTwo(height, this._caps.maxTextureSize);

            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MAG_FILTER, this._gl.LINEAR);

            if (!generateMipMaps) {
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR);
            } else {
                this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_MIN_FILTER, this._gl.LINEAR_MIPMAP_LINEAR);
            }
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);

            this._activeTexturesCache = [];
            texture._baseWidth = width;
            texture._baseHeight = height;
            texture._width = width;
            texture._height = height;
            texture.isReady = false;
            texture.generateMipMaps = generateMipMaps;
            texture.references = 1;

            this._loadedTexturesCache.push(texture);

            return texture;
        }

        public updateDynamicTexture(texture: WebGLTexture, canvas: HTMLCanvasElement, invertY: boolean): void {
            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, invertY ? 1 : 0);
            this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, canvas);
            if (texture.generateMipMaps) {
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
            }
            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._activeTexturesCache = [];
            texture.isReady = true;
        }

        public updateVideoTexture(texture: WebGLTexture, video: HTMLVideoElement, invertY: boolean): void {
            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);
            this._gl.pixelStorei(this._gl.UNPACK_FLIP_Y_WEBGL, invertY ? 0 : 1); // Video are upside down by default

            // Scale the video if it is a NPOT using the current working canvas
            if (video.videoWidth !== texture._width || video.videoHeight !== texture._height) {
                if (!texture._workingCanvas) {
                    texture._workingCanvas = document.createElement("canvas");
                    texture._workingContext = texture._workingCanvas.getContext("2d");
                    texture._workingCanvas.width = texture._width;
                    texture._workingCanvas.height = texture._height;
                }

                texture._workingContext.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, texture._width, texture._height);

                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, texture._workingCanvas);
            } else {
                this._gl.texImage2D(this._gl.TEXTURE_2D, 0, this._gl.RGBA, this._gl.RGBA, this._gl.UNSIGNED_BYTE, video);
            }

            if (texture.generateMipMaps) {
                this._gl.generateMipmap(this._gl.TEXTURE_2D);
            }

            this._gl.bindTexture(this._gl.TEXTURE_2D, null);
            this._activeTexturesCache = [];
            texture.isReady = true;
        }

        public createRenderTargetTexture(size: any, options): WebGLTexture {
            // old version had a "generateMipMaps" arg instead of options.
            // if options.generateMipMaps is undefined, consider that options itself if the generateMipmaps value
            // in the same way, generateDepthBuffer is defaulted to true
            var generateMipMaps = false;
            var generateDepthBuffer = true;
            var samplingMode = BABYLON.Texture.TRILINEAR_SAMPLINGMODE;
            if (options !== undefined) {
                generateMipMaps = options.generateMipMaps === undefined ? options : options.generateMipmaps;
                generateDepthBuffer = options.generateDepthBuffer === undefined ? true : options.generateDepthBuffer;
                if (options.samplingMode !== undefined) {
                    samplingMode = options.samplingMode;
                }
            }
            var gl = this._gl;

            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            var width = size.width || size;
            var height = size.height || size;
            var magFilter = gl.NEAREST;
            var minFilter = gl.NEAREST;
            if (samplingMode === BABYLON.Texture.BILINEAR_SAMPLINGMODE) {
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_NEAREST;
                } else {
                    minFilter = gl.LINEAR;
                }
            } else if (samplingMode === BABYLON.Texture.TRILINEAR_SAMPLINGMODE) {
                magFilter = gl.LINEAR;
                if (generateMipMaps) {
                    minFilter = gl.LINEAR_MIPMAP_LINEAR;
                } else {
                    minFilter = gl.LINEAR;
                }
            }
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, magFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, minFilter);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

            var depthBuffer: WebGLRenderbuffer;
            // Create the depth buffer
            if (generateDepthBuffer) {
                depthBuffer = gl.createRenderbuffer();
                gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
                gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
            }
            // Create the framebuffer
            var framebuffer = gl.createFramebuffer();
            gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
            if (generateDepthBuffer) {
                gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthBuffer);
            }

            // Unbind
            gl.bindTexture(gl.TEXTURE_2D, null);
            gl.bindRenderbuffer(gl.RENDERBUFFER, null);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);

            texture._framebuffer = framebuffer;
            if (generateDepthBuffer) {
                texture._depthBuffer = depthBuffer;
            }
            texture._width = width;
            texture._height = height;
            texture.isReady = true;
            texture.generateMipMaps = generateMipMaps;
            texture.references = 1;
            this._activeTexturesCache = [];

            this._loadedTexturesCache.push(texture);

            return texture;
        }

        public createCubeTexture(rootUrl: string, scene: Scene, extensions: string[], noMipmap?: boolean): WebGLTexture {
            var gl = this._gl;

            var texture = gl.createTexture();
            texture.isCube = true;
            texture.url = rootUrl;
            texture.references = 1;
            this._loadedTexturesCache.push(texture);

            cascadeLoad(rootUrl, 0, [], scene, imgs => {
                var width = getExponantOfTwo(imgs[0].width, this._caps.maxCubemapTextureSize);
                var height = width;

                this._workingCanvas.width = width;
                this._workingCanvas.height = height;

                var faces = [
                    gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
                    gl.TEXTURE_CUBE_MAP_NEGATIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z
                ];

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture);
                gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);

                for (var index = 0; index < faces.length; index++) {
                    this._workingContext.drawImage(imgs[index], 0, 0, imgs[index].width, imgs[index].height, 0, 0, width, height);
                    gl.texImage2D(faces[index], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this._workingCanvas);
                }

                if (!noMipmap) {
                    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
                }

                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, noMipmap ? gl.LINEAR : gl.LINEAR_MIPMAP_LINEAR);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

                gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);

                this._activeTexturesCache = [];

                texture._width = width;
                texture._height = height;
                texture.isReady = true;
            }, extensions);

            return texture;
        }

        public _releaseTexture(texture: WebGLTexture): void {
            var gl = this._gl;

            if (texture._framebuffer) {
                gl.deleteFramebuffer(texture._framebuffer);
            }

            if (texture._depthBuffer) {
                gl.deleteRenderbuffer(texture._depthBuffer);
            }

            gl.deleteTexture(texture);

            // Unbind channels
            for (var channel = 0; channel < this._caps.maxTexturesImageUnits; channel++) {
                this._gl.activeTexture(this._gl["TEXTURE" + channel]);
                this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
                this._activeTexturesCache[channel] = null;
            }

            var index = this._loadedTexturesCache.indexOf(texture);
            if (index !== -1) {
                this._loadedTexturesCache.splice(index, 1);
            }
        }

        public bindSamplers(effect: Effect): void {
            this._gl.useProgram(effect.getProgram());
            var samplers = effect.getSamplers();
            for (var index = 0; index < samplers.length; index++) {
                var uniform = effect.getUniform(samplers[index]);
                this._gl.uniform1i(uniform, index);
            }
            this._currentEffect = null;
        }


        public _bindTexture(channel: number, texture: WebGLTexture): void {
            this._gl.activeTexture(this._gl["TEXTURE" + channel]);
            this._gl.bindTexture(this._gl.TEXTURE_2D, texture);

            this._activeTexturesCache[channel] = null;
        }

        public setTextureFromPostProcess(channel: number, postProcess: PostProcess): void {
            this._bindTexture(channel, postProcess._textures.data[postProcess._currentRenderTextureInd]);
        }

        public setTexture(channel: number, texture: Texture): void {
            if (channel < 0) {
                return;
            }
            // Not ready?
            if (!texture || !texture.isReady()) {
                if (this._activeTexturesCache[channel] != null) {
                    this._gl.activeTexture(this._gl["TEXTURE" + channel]);
                    this._gl.bindTexture(this._gl.TEXTURE_2D, null);
                    this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, null);
                    this._activeTexturesCache[channel] = null;
                }
                return;
            }

            // Video
            if (texture instanceof BABYLON.VideoTexture) {
                if ((<VideoTexture>texture).update()) {
                    this._activeTexturesCache[channel] = null;
                }
            } else if (texture.delayLoadState == BABYLON.Engine.DELAYLOADSTATE_NOTLOADED) { // Delay loading
                texture.delayLoad();
                return;
            }

            if (this._activeTexturesCache[channel] == texture) {
                return;
            }
            this._activeTexturesCache[channel] = texture;

            var internalTexture = texture.getInternalTexture();
            this._gl.activeTexture(this._gl["TEXTURE" + channel]);

            if (internalTexture.isCube) {
                this._gl.bindTexture(this._gl.TEXTURE_CUBE_MAP, internalTexture);

                if (internalTexture._cachedCoordinatesMode !== texture.coordinatesMode) {
                    internalTexture._cachedCoordinatesMode = texture.coordinatesMode;
                    // CUBIC_MODE and SKYBOX_MODE both require CLAMP_TO_EDGE.  All other modes use REPEAT.
                    var textureWrapMode = (texture.coordinatesMode !== BABYLON.Texture.CUBIC_MODE && texture.coordinatesMode !== BABYLON.Texture.SKYBOX_MODE) ? this._gl.REPEAT : this._gl.CLAMP_TO_EDGE;
                    this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_S, textureWrapMode);
                    this._gl.texParameteri(this._gl.TEXTURE_CUBE_MAP, this._gl.TEXTURE_WRAP_T, textureWrapMode);
                }

                this._setAnisotropicLevel(this._gl.TEXTURE_CUBE_MAP, texture);
            } else {
                this._gl.bindTexture(this._gl.TEXTURE_2D, internalTexture);

                if (internalTexture._cachedWrapU !== texture.wrapU) {
                    internalTexture._cachedWrapU = texture.wrapU;

                    switch (texture.wrapU) {
                        case BABYLON.Texture.WRAP_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.REPEAT);
                            break;
                        case BABYLON.Texture.CLAMP_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.CLAMP_TO_EDGE);
                            break;
                        case BABYLON.Texture.MIRROR_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_S, this._gl.MIRRORED_REPEAT);
                            break;
                    }
                }

                if (internalTexture._cachedWrapV !== texture.wrapV) {
                    internalTexture._cachedWrapV = texture.wrapV;
                    switch (texture.wrapV) {
                        case BABYLON.Texture.WRAP_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.REPEAT);
                            break;
                        case BABYLON.Texture.CLAMP_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.CLAMP_TO_EDGE);
                            break;
                        case BABYLON.Texture.MIRROR_ADDRESSMODE:
                            this._gl.texParameteri(this._gl.TEXTURE_2D, this._gl.TEXTURE_WRAP_T, this._gl.MIRRORED_REPEAT);
                            break;
                    }
                }

                this._setAnisotropicLevel(this._gl.TEXTURE_2D, texture);
            }
        }

        public _setAnisotropicLevel(key: number, texture: Texture) {
            var anisotropicFilterExtension = this._caps.textureAnisotropicFilterExtension;

            if (anisotropicFilterExtension && texture._cachedAnisotropicFilteringLevel !== texture.anisotropicFilteringLevel) {
                this._gl.texParameterf(key, anisotropicFilterExtension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropicFilteringLevel, this._caps.maxAnisotropy));
                texture._cachedAnisotropicFilteringLevel = texture.anisotropicFilteringLevel;
            }
        }

        public readPixels(x: number, y: number, width: number, height: number): Uint8Array {
            var data = new Uint8Array(height * width * 4);
            this._gl.readPixels(0, 0, width, height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);
            return data;
        }

        // Dispose
        public dispose(): void {
            this.stopRenderLoop();

            // Release scenes
            while (this.scenes.length) {
                this.scenes[0].dispose();
            }

            // Release effects
            for (var name in this._compiledEffects) {
                this._gl.deleteProgram(this._compiledEffects[name]._program);
            }

            // Events
            window.removeEventListener("blur", this._onBlur);
            window.removeEventListener("focus", this._onFocus);
            document.removeEventListener("fullscreenchange", this._onFullscreenChange);
            document.removeEventListener("mozfullscreenchange", this._onFullscreenChange);
            document.removeEventListener("webkitfullscreenchange", this._onFullscreenChange);
            document.removeEventListener("msfullscreenchange", this._onFullscreenChange);
            document.removeEventListener("pointerlockchange", this._onPointerLockChange);
            document.removeEventListener("mspointerlockchange", this._onPointerLockChange);
            document.removeEventListener("mozpointerlockchange", this._onPointerLockChange);
            document.removeEventListener("webkitpointerlockchange", this._onPointerLockChange);
        }

        // Statics
        public static isSupported(): boolean {
            try {
                var tempcanvas = document.createElement("canvas");
                var gl = tempcanvas.getContext("webgl") || tempcanvas.getContext("experimental-webgl");

                return gl != null && !!window.WebGLRenderingContext;
            } catch (e) {
                return false;
            }
        }
    }
} 