

var EditorCamera = function(app){
	var self = this;
	var camera = new pc.Entity();
	camera.addComponent("camera", {
	    clearColor: new pc.Color(0.4, 0.45, 0.5)
	});


    app.assets.loadFromUrl('./js/camera/camera.js', 'script', function(err, asset){
        camera.addComponent('script');
        camera.script.create('camera');
    })

    return camera;

}

