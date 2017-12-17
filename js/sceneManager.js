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
			{
				html : '<i class="fa fa-cube"></i>  Plane',
				callback : function(){
					self.add('plane');
				}
			},
			'separate',
			{
				html : '<i class="fa fa-lightbulb-o"></i>  Point Light',
				callback : function(){
					self.addLight('point');
				}
			},
			{
				html : '<i class="fa fa-sun-o"></i>  Directional Light',
				callback : function(){
					self.addLight('directional');
				}
			},
			{
				html : '<i class="fa fa-wifi fa-flip-vertical"></i>  Spot Light',
				callback : function(){
					self.addLight('spot');
				}
			},
		];
	},
	add : function(type){
		var self = this;
		var entity = new pc.Entity();
		var dom = document.createElement('li');
		var eventDom = document.createElement('div');

		if(type == 'cube'){
			entity.name = "New Cube";
			entity.addComponent("model", {
			    type: "box",
			});
			eventDom.innerHTML = '<i class=\"fa fa-cube\"></i> ';
		}else if(type == 'plane'){
			entity.name = "New Plane";
			entity.addComponent("model", {
			    type: "plane",
			});
			eventDom.innerHTML = '<i class=\"fa fa-cube\"></i> ';
		}


		var name = document.createElement('span');
		name.innerText = entity.name;
		eventDom.appendChild(name);
		eventDom.nodeNameDom = name;
		// dom.eventDom = eventDom;
		dom.appendChild(eventDom);
		var node = new SceneNode(dom, entity, this);
		entity.node = node;
		this.currentSelectNode.addChild(node);



		entity.selectedHandler = function(){
			node.select();
			// if(!entity.gizmo){
			// 	entity.gizmo = self.editor.gizmo.clone();
			// 	entity.addChild(entity.gizmo);
			// }
			// if(self.editor.activeGizmo)
			// 	self.editor.activeGizmo.enabled = false;
			// self.editor.activeGizmo = entity.gizmo;
			// entity.gizmo.root.enabled = true;
		}
		this.editor.menuManager.destroyMenu();
	},
	addLight : function(type){
		var entity = new pc.Entity();
		if(type == 'point'){
			entity.name = "New Point Light";
			entity.addComponent('light',{
				type: "point",
			    color: new pc.Color(1, 1, 1),
			    range: 10
			});

			entity.addComponent('element',{

			});
			var dom = document.createElement('li');
			var eventDom = document.createElement('div');
			eventDom.innerHTML = '<i class=\"fa fa-lightbulb-o\"></i> ';

			var name = document.createElement('span');
			name.innerText = entity.name;
			eventDom.appendChild(name);
			eventDom.nodeNameDom = name;
			// dom.eventDom = eventDom;
			dom.appendChild(eventDom);
			var node = new SceneNode(dom, entity, this);
			entity.node = node;
			this.currentSelectNode.addChild(node);
		}
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
	    	self.select();
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
    	this.manager.currentSelectNode.unSelect();
    	this.manager.currentSelectNode = this;
		this.eventDom.classList.add('select');
		if(this == this.manager.root)return;
		this.manager.editor.settingManager.load(this);
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