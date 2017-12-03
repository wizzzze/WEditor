var Camera = pc.createScript('camera');

Camera.attributes.add('maxElevation', {
    type: 'number',
    title: 'Max Elevation',
    default: 300
});


// initialize code called once per entity
Camera.prototype.initialize = function() {
    var self = this;
    this.viewPos =  new pc.Vec3(10, 10, 10);
    this.targetViewPos = new pc.Vec3(0,0,0);
    this.tempVec = new pc.Vec3();

    this.distance = 10;
    this.targetDistance = 10;

    this.rotX = -180;
    this.rotY = 0;
    this.targetRotX = -40;
    this.targetRotY = 30;
    this.quatX = new pc.Quat();
    this.quatY = new pc.Quat();
    
    this.transformStarted = false;
    
    
    var options = {
        prevent_default: true,
        drag_max_touches: 2,
        transform_min_scale: 0.08,
        transform_min_rotation: 180,
        transform_always_block: true,
        hold: false,
        release: false,
        swipe: false,
        tap: false
    };
    
    var cachedTargetDistance;
    
    var cachedX, cachedY;
    
    this.hammer = Hammer(this.app.graphicsDevice.canvas, options);
    
    
    self.hammer.on("transformstart", function (event) {
        self.transformStarted = true;
        cachedTargetDistance = self.targetDistance;

        event.preventDefault();
        self.hammer.options.drag = false;
    }.bind(self));
    self.hammer.on("transformend", function (event) {
        self.transformStarted = false;
        self.hammer.options.drag = true;
    }.bind(self));
    self.hammer.on("transform", function (event) {
        if (self.transformStarted) {
            var gesture = event.gesture;
            var scale = gesture.scale;
            self.targetDistance = cachedTargetDistance / scale;
        }
    }.bind(self)); 
    self.hammer.on("dragstart", function (event) {
        if (!self.transformStarted) {
            var gesture = event.gesture;
            var numTouches = (gesture.touches !== undefined) ? gesture.touches.length : 1;
            self.panning = (numTouches === 2);
            self.dragStarted = true;

            cachedX = gesture.center.pageX;
            cachedY = gesture.center.pageY;
        }
    }.bind(self));
    self.hammer.on("dragend", function (event) {
        if (self.dragStarted) {
            self.dragStarted = false;
            self.panning = false;
        }
    }.bind(self));
    self.hammer.on("drag", function (event) {
        var gesture = event.gesture;
        var dx = gesture.center.pageX - cachedX;
        var dy = gesture.center.pageY - cachedY;
        if (self.panning) {
            self.pan(dx * -0.025, dy * 0.025);
        } else {
            self.orbit(dx * 0.5, dy * 0.5);
        }
        cachedX = gesture.center.pageX;
        cachedY = gesture.center.pageY;
    }.bind(self));
    console.log(this.app);
    
    self.app.mouse.on(pc.EVENT_MOUSEMOVE, self.onMouseMove, self);
    self.app.mouse.on(pc.EVENT_MOUSEWHEEL, self.onMouseWheel, self);
       
};

// update code called every frame
Camera.prototype.update = function(dt) {
    // Implement a delay in camera controls by lerping towards a target
    this.viewPos.lerp(this.viewPos, this.targetViewPos, dt / 0.1);
    this.distance = pc.math.lerp(this.distance, this.targetDistance, dt / 0.2);
    this.rotX = pc.math.lerp(this.rotX, this.targetRotX, dt / 0.2);
    this.rotY = pc.math.lerp(this.rotY, this.targetRotY, dt / 0.2);

    // Calculate the camera's rotation
    this.quatX.setFromAxisAngle(pc.Vec3.RIGHT, -this.rotY);
    this.quatY.setFromAxisAngle(pc.Vec3.UP, -this.rotX);
    this.quatY.mul(this.quatX);

    // Set the camera's current position and orientation
    this.entity.setPosition(this.viewPos);
    this.entity.setRotation(this.quatY);
    this.entity.translateLocal(0, 0, this.distance);
};

// swap method called for script hot-reloading
// inherit your script state here
// Camera.prototype.swap = function(old) { };

// to learn more about script anatomy, please read:
// http://developer.playcanvas.com/en/user-manual/scripting/

Camera.prototype.pan = function(movex, movey) {
    // Pan around in the camera's local XY plane
    this.tempVec.copy(this.entity.right).scale(movex);
    this.targetViewPos.add(this.tempVec);
    this.tempVec.copy(this.entity.up).scale(movey);
    this.targetViewPos.add(this.tempVec);
};

Camera.prototype.dolly = function (movez) {
    // Dolly along the Z axis of the camera's local transform
    this.targetDistance += movez;
    if (this.targetDistance < 0) {
        this.targetDistance = 0;
    }
};

Camera.prototype.orbit = function (movex, movey) {
    this.targetRotX += movex;
    this.targetRotY += movey;
    this.targetRotY = pc.math.clamp(this.targetRotY, -this.maxElevation, this.maxElevation);
};

Camera.prototype.onMouseWheel = function (event) {
    event.event.preventDefault();
    this.dolly(event.wheel * -4);
};

Camera.prototype.onMouseMove = function (event) {
    if (event.buttons[pc.MOUSEBUTTON_LEFT]) {
        this.orbit(event.dx * 0.2, event.dy * 0.2);
    } else if (event.buttons[pc.MOUSEBUTTON_RIGHT]) {
        var factor = this.distance / 700;
        this.pan(event.dx * -factor, event.dy * factor);
    }
};
