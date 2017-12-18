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

	this.assetManager = new SceneManager(this);
	this.settingManager = new SettingManager(this);
	this.assetManager = new AssetManager(this, 'assets_hierarchy' ,'assets_container');
	this.menuManager = new MenuManager(this);


	this.gridHelper = new GridHelper(this.app.graphicsDevice, 14, 14);
	app.scene.addModel(this.gridHelper);

	assetManager.setData([
			{
				name : 'Textures',
				type : 'folder',
				children : [
					{
						name : 'Textures',
						type : 'folder',
						children : [],
					},
				],
			},

			{
				name : 'Models',
				type : 'folder',
				children : [

				],
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

	
	var camera = new EditorCamera(app);

	this.picker = new Picker(app, camera);

	this.gizmo = new Gizmo(app);
	
	// this.gizmo.root.enabled = false;
	// app.root.addChild(this.gizmo.root);
	app.root.addChild(camera);

	app.on('update', function(dt){
		// console.log(dt);
	})

})(Editor);


Editor.defaultMaterial = new pc.StandardMaterial();
Editor.defaultMaterial.name = 'Empty';



