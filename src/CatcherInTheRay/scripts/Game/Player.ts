module GAME {
    export class Player {
        INTERSECTION_TRESHOLD: number = 4;
        BASE_ACCELERATION: number = 2;
        BASE_JUMP_POW: number = 2;
        LAND_COOLDOWN: number = 300;
        ROTATION_APPROXIMATOR: number = 4;
        MINVECTOR: BABYLON.Vector3 = new BABYLON.Vector3(-2, -10, -2);
        MAXVECTOR: BABYLON.Vector3 = new BABYLON.Vector3(2, 10, 2);
        GRAVITY: BABYLON.Vector3 = new BABYLON.Vector3(0, -0.15, 0);

        _mesh: BABYLON.Mesh;
        _parent: BABYLON.Mesh;
        _scene: BABYLON.Scene;
        _bottomVector: BABYLON.Vector3;
        _ray: BABYLON.Ray;
        _ground: BABYLON.Mesh;

        _acceptedKeys: {} = { "32": 32, "87": 87, "68": 68, "83": 83, "65": 65 };
        CurrentRotation: number = 0;
        _keys: any = { "32": 0, "87": 0, "68": 0, "83": 0, "65": 0 };
        _landTime: number = 0;

        rotationMatrix: BABYLON.Matrix;
        velocity: BABYLON.Vector3;
        isOnGround: boolean;


        constructor(mesh: BABYLON.Mesh, ground: BABYLON.Mesh, scene: BABYLON.Scene) {
            this._scene = scene;
            this._ground = ground;
            this._mesh = mesh;
            this._parent = Cast<BABYLON.Mesh>(mesh.parent);

            //debug
            Cast<any>(this._mesh).player = this;
            Cast<any>(window).player = this;

            this._bottomVector = new BABYLON.Vector3(0, -5, 0);
            this._ray = new BABYLON.Ray(null, new BABYLON.Vector3(0, -1, 0));

            this.rotationMatrix = new BABYLON.Matrix();
            this.velocity = BABYLON.Vector3.Zero();
            this.isOnGround = false;

            var boundingInfo = this._mesh.getBoundingInfo();
            this._parent.checkCollisions = true;
            this._parent.rotationQuaternion = new BABYLON.Quaternion(0, 0, 0, 1);

            scene.getPhysicsEngine()._unregisterMesh(this._mesh);
            scene.registerBeforeRender(() => {
                var lastFrame = scene.getLastFrameDuration();

                this._ray.origin = this._parent.position.add(this._bottomVector);
                var intersection = this._ground.intersects(this._ray);
                if (intersection.hit && intersection.distance < this.INTERSECTION_TRESHOLD) {

                    this._parent.position.y = intersection.pickedPoint.y - this._bottomVector.y;
                    this.velocity.y = 0;
                    if (!this.isOnGround) {
                        this.isOnGround = true;
                        this._landTime = Date.now();
                    }
                } else {
                    this.velocity.addInPlace(this.GRAVITY);
                }

                this.readKeys();
                this.velocity = BABYLON.Vector3.Clamp(this.velocity, this.MINVECTOR, this.MAXVECTOR);

                if (this.velocity.length() > 0.001) {
                    this._parent.rotationQuaternion.toRotationMatrix(this.rotationMatrix);
                    this._parent.moveWithCollisions(BABYLON.Vector3.TransformCoordinates(this.velocity, this.rotationMatrix));
                } else {
                    this.velocity.scaleInPlace(0);
                }

                if (this.isOnGround) {
                    this.velocity.scaleInPlace(0.8);
                }
            });

            window.addEventListener("keydown", evt=> {
                if (evt.keyCode in this._acceptedKeys) {
                    if (this._keys[evt.keyCode] === 0) {
                        this._keys[evt.keyCode] = 1;
                        this._activeKeys++;
                    }
                    evt.preventDefault();
                }
            });
            window.addEventListener("keyup", evt=> {
                if (evt.keyCode in this._acceptedKeys) {
                    this._keys[evt.keyCode] = 0;
                    this._activeKeys--;
                    if (this._activeKeys == 0) {
                        this._rotationOffset = this._lastRotationTarget;
                    }
                    evt.preventDefault();
                }
            });
        }

        _activeKeys: number = 0;
        _rotationOffset: number = 0;
        _lastRotationTarget: number = 0;

        public Jump(power: number) {
            if (Date.now() - this._landTime < this.LAND_COOLDOWN) return;
            this.velocity.y = (this.BASE_JUMP_POW);
            this._parent.position.y += 3;
            this.isOnGround = false;
        }

        public Accelerate(factor: number) {
            this.velocity.z -= (factor * this.BASE_ACCELERATION);
        }

        public RotateTo(targetRot: number) {
            if (this.CurrentRotation == targetRot) return;
            var diff = targetRot - this.CurrentRotation;
            if (Math.abs(diff) > Math.PI) diff = diff - 2 * Math.PI;
            if (Math.abs(diff) < Math.PI / 10) {
                this._parent.rotate(BABYLON.Axis.Y, diff, BABYLON.Space.LOCAL);
            } else {
                diff /= this.ROTATION_APPROXIMATOR;
                this._parent.rotate(BABYLON.Axis.Y, diff, BABYLON.Space.LOCAL);
            }
            this.CurrentRotation += diff;

            if (Math.abs(this.CurrentRotation) > Math.PI*2) {
                this.CurrentRotation = this.CurrentRotation % (Math.PI*2);
            }
        }

        private readKeys() {

            if (this._keys[32] > 0) {
                if (this.isOnGround) {
                    console.log("JUMPING");
                    this.Jump(1);
                    delete this._keys[32];
                }
            }
            if (this.isOnGround || true) {
                var start = { x: 0, y: 0 };

                if (this._keys[87]) start.y += 1; //w
                if (this._keys[83]) start.y -= 1; //s
                if (this._keys[65]) start.x += 1; //a
                if (this._keys[68]) start.x -= 1; //d 

                var result = (start.x + 1) * 10 + (start.y + 1);
                switch (result) {
                    case 11: // do nothing
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
        }
    }
}

