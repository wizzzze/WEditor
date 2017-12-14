var SceneManager = function(editor){
	this.editor = editor;
	this.rootContainer = document.getElementById('scene_root');
	this.root = new SceneNode(this.rootContainer, editor.app.root, this);

	this.currentSelectNode = this.root;

	var self = this;
	//bind events

	document.querySelector('.scene_list_container a[data-action="add"]').addEventListener('click', function(event){
		event.stopPropagation();
		var target = event.target;
		editor.menuManager.createMenu(self.addMenu(), this, {
			cache : true,
		});
	});

}


SceneManager.prototype = {
	addMenu : function(){
		var self = this;
		return [
			{
				html : '<i class="fa fa-cube"></i>  Cube',
				callback : function(){
					self.add('cube');
				}
			},
			'separate',
			{
				html : '<i class="fa fa-lightbulb-o"></i>  Point Light',
				callback : function(){
					self.addLight('point light');
				}
			},
			{
				html : '<i class="fa fa-sun-o"></i>  Directional Light',
				callback : function(){
					self.addLight('directional light');
				}
			},
			{
				html : '<i class="fa fa-feed"></i>  Spot Light',
				callback : function(){
					self.addLight('spot light');
				}
			},
		];
	},
	add : function(type){
		if(type == 'cube'){
			var cube = new pc.Entity();
			cube.name = "New Cube";
			cube.addComponent("model", {
			    type: "box",
			});
			var dom = document.createElement('li');
			var eventDom = document.createElement('div');
			eventDom.innerHTML = '<i class=\"fa fa-cube\"></i> ';

			var name = document.createElement('span');
			name.innerText = cube.name;
			eventDom.appendChild(name);
			eventDom.nodeNameDom = name;
			// dom.eventDom = eventDom;
			dom.appendChild(eventDom);
			var node = new SceneNode(dom, cube, this);
			cube.node = node;
			this.currentSelectNode.addChild(node);
		}

		this.editor.menuManager.destroyMenu();
	},
	addLight : function(type){

	}
};


var SceneNode = function(dom, entity, manager){
	var self = this;
	this.dom = dom;
	this.entity = entity;
	this.entity.on('changeName', function(){
		self.dom.childNodes[0].nodeNameDom.innerText = self.entity.name;
	})
	this.manager = manager;

	this.eventDom = null;
	this.childContainer = null;

	var childNodes = dom.childNodes;

	for(var i in childNodes){
		var child = childNodes[i];
		if(child.tagName == 'DIV'){
			this.eventDom = child;
		}else if(child.tagName == "UL"){
			this.childContainer = child;
		}
	}

	this.eventDom.addEventListener('mousedown', function(e){

	    e.stopPropagation();
	    e.preventDefault();
		var isRightMB;
	    e = e || window.event;

	    if ("which" in e)  // Gecko (Firefox), WebKit (Safari/Chrome) & Opera
	        isRightMB = e.which == 3; 
	    else if ("button" in e)  // IE, Opera 
	        isRightMB = e.button == 2; 
	    if(isRightMB){
			manager.editor.menuManager.createMenu([
				{
					html : function(){
						return self.entity.enabled?'Disable':'Enable';
					},
					callback : function(){
						self.entity.enabled = !self.entity.enabled;
					}
				},
				{
					html : 'Remove',
					callback : function(){
						self.remove();
						self.manager.editor.menuManager.destroyMenu();
					}

				},
			], e);
	    }else{
	    	manager.currentSelectNode.unSelect();
	    	manager.currentSelectNode = self;
	    	self.select();
			if(self == self.manager.root) return;
	    	self.manager.editor.settingManager.load(self);
	    }

	});
}

SceneNode.prototype = {
	addChild : function(node){
		if(node instanceof SceneNode){
			if(this.childContainer == null){
				this.dom.classList.add('has-child');
				this.childContainer = document.createElement('ul');
				this.childContainer.classList.add('scene_list');
				this.dom.appendChild(this.childContainer);
			}
			this.entity.addChild(node.entity);
			this.childContainer.appendChild(node.dom);
			node.parent = this;
		}else{	
			console.error('SceneNode.add function: params must be a instance of senceNode');
		}

	},
	select : function(){
		this.eventDom.classList.add('select');
	},
	unSelect : function(){
		this.eventDom.classList.remove('select');
	},
	remove : function(){
		var parent = this.parent;
		parent.removeChild(this);
		
	},
	removeChild : function(node){
		node.entity.destroy();
		this.childContainer.removeChild(node.dom);
	},
}