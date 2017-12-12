document.addEventListener('contextmenu', function(e){
	e.preventDefault();
});



var Editor = function(){};
(function(Editor){
	var canvas = document.getElementById("canvas");

	var appMouse = new pc.Mouse(canvas);
	var app = new pc.Application(canvas,{
		mouse : appMouse,
	});
	app.start();
	this.app = app;

	this.assetManager = new AssetManager(this, 'assets_hierarchy' ,'assets_container');
	this.menuManager = new MenuManager(this);

	assetManager.setData([
			{
				name : 'Textures',
				type : 'folder',
				children : [],
			},

			{
				name : 'Models',
				type : 'folder',
				children : [],
			},

			{
				name : 'model.json',
				type : 'model',
			}
		]

	);


	window.addEventListener('resize', function(){
		app.setCanvasResolution(pc.RESOLUTION_AUTO);
	});
	
	app.setCanvasResolution(pc.RESOLUTION_AUTO);
	app.scene.ambientLight = new pc.Color(0.2, 0.2, 0.2);
	var box = new pc.Entity();
	box.addComponent("model", {
	    type: "box",
	});

	// Create an Entity with a point light component and a sphere model component.
	var light = new pc.Entity();
	light.addComponent("light", {
	    type: "point",
	    color: new pc.Color(1, 1, 1),
	    radius: 10
	});
	// Scale the sphere down to 0.1m
	light.range = 5;
	light.setLocalScale(0.1, 0.1, 0.1);
	light.setPosition(2, 2, 2);

	// Create an Entity with a camera component
	var camera = new EditorCamera(app);

	// Add the new Entities to the hierarchy
	app.root.addChild(box);
	app.root.addChild(light);
	app.root.addChild(camera);

})(Editor);


Editor.defaultMaterial = new pc.StandardMaterial();



