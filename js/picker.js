var Picker = function(app, camera){
	this.app = app;
	this.cameraEntity = camera;

	this.ray = new pc.Ray();
    
    // Keep an array of all the entities we can pick at
    this.pickableEntities = [];
    this.pickableShapes = [];
    
    // Register events for when pickable entities are created
    this.app.on("shapepicker:add", this.addItem, this);
    this.app.on("shapepicker:remove", this.removeItem, this);
    
    // Register the mouse down and touch start event so we know when the user has clicked
    this.app.mouse.on(pc.EVENT_MOUSEDOWN, this.onMouseDown, this);
    
    if (this.app.touch) {
        this.app.touch.on(pc.EVENT_TOUCHSTART, this.onTouchStart, this);
    }
    
    this.hitPosition = new pc.Vec3();
}


Picker.prototype.doRayCast = function (screenPosition) {
    // Initialise the ray and work out the direction of the ray from the a screen position
    this.cameraEntity.camera.screenToWorld(screenPosition.x, screenPosition.y, this.cameraEntity.camera.farClip, this.ray.direction); 
    this.ray.origin.copy(this.cameraEntity.getPosition());
    this.ray.direction.sub(this.ray.origin).normalize();

    var entities = this.app.root.children;
    
    // Test the ray against all the objects registered to this picker
    for (var i = 0; i < entities.length; ++i) {
    	var entity = entities[i];
    	if(entity.model){
    		// entity.model.meshInstances.forEach()
        	var result = this.entityPicked(entity.model.meshInstances);
    	}
        
        if (result && entity.selectedHandler) {
        	entity.selectedHandler();
        }
    }    
};

Picker.prototype.entityPicked = function(meshInstances){
	var i = 0;
	var length = meshInstances.length;
	while(i < length){
		var meshInstance = meshInstances[i];
		var result = meshInstance.aabb.intersectsRay(this.ray, this.hitPosition);
		if(result) return true;
		i++;
	}
};

Picker.prototype.onMouseDown = function(event) {
    if (event.button == pc.MOUSEBUTTON_LEFT) {
        this.doRayCast(event);
    }
};

Picker.prototype.onTouchStart = function (event) {
    // On perform the raycast logic if the user has one finger on the screen
    if (event.touches.length == 1) {
        this.doRayCast(event.touches[0]);
        
        // Android registers the first touch as a mouse event so it is possible for 
        // the touch event and mouse event to be triggered at the same time
        // Doing the following line will prevent the mouse down event from triggering
        event.event.preventDefault();
    }    
};

Picker.prototype.addItem = function (entity, shape) {
    if (entity) {
        this.pickableEntities.push(entity);
        this.pickableShapes.push(shape);
    }
};
        
Picker.prototype.removeItem = function (entity) {
    var i = this._items.indexOf(entity);
    if (i >= 0) {
        this.pickableEntities.splice(i, 1);
        this.pickableShapes.splice(i, 1);
    }
};