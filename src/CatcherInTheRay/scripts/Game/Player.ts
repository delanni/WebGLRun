module GAME {
    export interface ICharaceterAnimationProperties {
        start: number;
        end: number;
        speed: number;
        repeat: boolean;
    }

    export interface ICharacterModelDictionary {
        RUN: ICharaceterAnimationProperties;
        STAY: ICharaceterAnimationProperties;
        JUMP: ICharaceterAnimationProperties;
        ScalingVector: BABYLON.Vector3;
    }

    export class Player {
        INTERSECTION_TRESHOLD: number = 4;
        BASE_ACCELERATION: number = 2;
        BASE_JUMP_POW: number = 2.8;
        LAND_COOLDOWN: number = 100;
        ROTATION_APPROXIMATOR: number = 4;
        MINVECTOR: BABYLON.Vector3 = new BABYLON.Vector3(-2, -10, -2);
        MAXVECTOR: BABYLON.Vector3 = new BABYLON.Vector3(2, 10, 2);
        GRAVITY: BABYLON.Vector3 = new BABYLON.Vector3(0, -0.15, 0);

        mesh: BABYLON.Mesh;
        parent: BABYLON.Mesh;

        _animationObject: BABYLON.Animation;
        _scene: BABYLON.Scene;
        _bottomVector: BABYLON.Vector3;
        _ray: BABYLON.Ray;
        _ground: BABYLON.Mesh;

        Controller: any = { "32": 0, "87": 0, "68": 0, "83": 0, "65": 0, "82": 0 };
        _landTime: number = 0;
        _lastRescueTime: number = 0;
        CurrentRotation: number = 0;

        modelProperties: ICharacterModelDictionary;
        currentAnimation: BABYLON.Animatable;
        currentAnimationName: string;

        rotationMatrix: BABYLON.Matrix;
        velocity: BABYLON.Vector3;
        isOnGround: boolean;

        IsEnabled: boolean = false;

        public SetEnabled(value: boolean) {
            this.IsEnabled= value
        }

        constructor(scene: BABYLON.Scene, ground: BABYLON.Mesh) {
            this._scene = scene;
            this._ground = ground;

            this._bottomVector = new BABYLON.Vector3(0, -5, 0);
            this._ray = new BABYLON.Ray(null, new BABYLON.Vector3(0, -1, 0));

            this.rotationMatrix = new BABYLON.Matrix();
            this.velocity = BABYLON.Vector3.Zero();
            this.isOnGround = false;
        }

        public Initialize(mesh: BABYLON.Mesh) {
            this.mesh = mesh;
            this.parent = Cast<BABYLON.Mesh>(mesh.parent);

            // animation stuff
            this.modelProperties = MODEL_ANIMATIONS[this.mesh.id];
            this._animationObject = this.mesh.animations[0];
            Cast<any>(this.mesh).__defineSetter__("vertexData", (val) => {
                this.mesh.setVerticesData("position", val);
            });
            this.mesh.scaling = this.modelProperties.ScalingVector;

            var boundingInfo = this.mesh.getBoundingInfo();
            this.parent.checkCollisions = true;
            this.parent.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

            this._scene.getPhysicsEngine()._unregisterMesh(this.mesh);
            this._scene.registerBeforeRender(()=>this._gameLoop());
        }

        _lastUpdateTime :number = 0;
        public pushUpdate(positionData: any) {
            //basic
            if (positionData[3] > this._lastUpdateTime) {
                this._lastUpdateTime = positionData[3];
                this.velocity.copyFromFloats.apply(this.velocity,positionData[2]);
                this.parent.rotationQuaternion.copyFromFloats.apply(this.parent.rotationQuaternion,positionData[1]);
                this.parent.position.copyFromFloats.apply(this.parent.position,positionData[0]);
            }
        }

        private _gameLoop = function(){
            var lastFrame = this._scene.getLastFrameDuration();

            this._ray.origin = this.parent.position.add(this._bottomVector);
            var intersection = this._ground.intersects(this._ray);
            if (!this.Controller[32] && intersection.hit && intersection.distance < this.INTERSECTION_TRESHOLD) {
                this.parent.position.y = intersection.pickedPoint.y - this._bottomVector.y;
                this.velocity.y = 0;
                if (!this.isOnGround) {
                    this.isOnGround = true;
                    this._landTime = Date.now();
                    this.stopAnimation();
                }
            } else {
                this.velocity.addInPlace(this.GRAVITY);
            }

            this.ReadKeys(this.Controller);
            this.velocity = BABYLON.Vector3.Clamp(this.velocity, this.MINVECTOR, this.MAXVECTOR);

            if (this.velocity.length() > 0.001) {
                this.parent.rotationQuaternion.toRotationMatrix(this.rotationMatrix);
                this.parent.moveWithCollisions(BABYLON.Vector3.TransformCoordinates(this.velocity, this.rotationMatrix));
            } else {
                this.velocity.scaleInPlace(0);
            }

            if (this.isOnGround) {
                this.velocity.scaleInPlace(0.8);
            }
        }

        public Jump(power: number) {
            if (Date.now() - this._landTime < this.LAND_COOLDOWN) return;
            this.velocity.y = (this.BASE_JUMP_POW * power);
            this.parent.position.y += (1.5 * power * power);
            this.startAnimation("JUMP");
            this.isOnGround = false;
        }

        public Accelerate(factor: number) {
            this.startAnimation("RUN");
            this.velocity.z -= (factor * this.BASE_ACCELERATION);
        }

        public Rescue() {
            if (Date.now() - this._lastRescueTime< 5000) return;
            var down = BABYLON.Vector3.Up().negate();
            for (var i = 0; i < 16; i++) {
                var x = i* 5 * Math.sin(i*Math.PI/2);
                var z = i* 5 * Math.cos(i*Math.PI/2);
                var cranePos = this.parent.position.add(new BABYLON.Vector3(x, 50, z));
                var ray = new BABYLON.Ray(cranePos, down);
                var intersect = this._ground.intersects(ray);
                if (intersect.hit && intersect.pickedPoint.y < 5) {
                    this._lastRescueTime = Date.now();
                    this.isOnGround = true; //slowfall
                    this.stopAnimation();
                    this.velocity.scaleInPlace(0);
                    this.parent.position = cranePos;
                    break;
                }
            }
        }

        public RotateTo(targetRot: number) {
            if (this.CurrentRotation > Math.PI * 2) {
                this.CurrentRotation -= Math.PI * 2;
            } else if (this.CurrentRotation < -Math.PI * 2) {
                this.CurrentRotation += Math.PI * 2;
            }
            if (this.CurrentRotation == targetRot) return;

            var diff = targetRot - this.CurrentRotation;
            if (diff > Math.PI) {
                diff -= Math.PI * 2;
            } else if (diff < -Math.PI) {
                diff += Math.PI * 2;
            }

            if (Math.abs(diff) > Math.PI / 10) {
                diff /= this.ROTATION_APPROXIMATOR;
            }
            this.parent.rotate(BABYLON.Axis.Y, diff, BABYLON.Space.LOCAL);
            this.CurrentRotation += diff;

        }

        public ReadKeys(keys : any) {
            if (!this.IsEnabled) return; 
            if (keys[32] > 0) {
                if (this.isOnGround) {
                    this.Jump(1);
                    delete keys[32];
                } else if (Date.now() - this._landTime > 3000) {
                    // unstuck
                    this._landTime = Date.now();
                    this.Jump(1.5);
                    delete keys[32];
                }
            }
            if (this.isOnGround || true) {
                var start = { x: 0, y: 0 };

                if (keys[87]) start.y += 1; //w
                if (keys[83]) start.y -= 1; //s
                if (keys[65]) start.x += 1; //a
                if (keys[68]) start.x -= 1; //d 

                var result = (start.x + 1) * 10 + (start.y + 1);
                switch (result) {
                    case 11: // do nothing
                        this.startAnimation("STAY");
                        break;
                    case 21: // go -90deg -PI/2rad
                        this.Accelerate(1);
                        this.RotateTo(-Math.PI / 2);
                        break;
                    case 22: // go -45deg -PI/4rad
                        this.Accelerate(0.707106781);
                        this.RotateTo(-Math.PI / 4);
                        break;
                    case 12: // go 0deg   0rad
                        this.Accelerate(1);
                        this.RotateTo(0);
                        break;
                    case 2: // go 45deg PI/4rad
                        this.Accelerate(0.707106781);
                        this.RotateTo(Math.PI / 4);
                        break;
                    case 1: // go 90deg PI/2rad
                        this.Accelerate(1);
                        this.RotateTo(Math.PI / 2);
                        break;
                    case 0: //go 135deg 3PI/4rad
                        this.Accelerate(0.707106781);
                        this.RotateTo(3 * Math.PI / 4);
                        break;
                    case 10: //go 180deg  PIrad
                        this.Accelerate(1);
                        this.RotateTo(Math.PI);
                        break;
                    case 20: //go -135deg -3PI/4rad
                        this.Accelerate(0.707106781);
                        this.RotateTo(-Math.PI * 3 / 4);
                        break;
                }
            }
            if (keys[82]) {
                this.Rescue();
                delete keys[82];
            }
        }

        private startAnimation(animationKey: string, force?: boolean) {
            if (this.currentAnimationName == animationKey && !force) return;
            if (this.currentAnimationName == "JUMP") return;

            this.stopAnimation();

            var animationProps = Cast<ICharaceterAnimationProperties>(this.modelProperties[animationKey]);
            this.currentAnimation = this._scene.beginAnimation(
                this.mesh, animationProps.start, animationProps.end, animationProps.repeat, animationProps.speed);
            this.currentAnimationName = animationKey;
        }

        private stopAnimation() {
            if (this.currentAnimation) {
                this.currentAnimation.stop();
                delete this.currentAnimation;
                delete this.currentAnimationName;
            }
        }
    }
}

