var SettingManager = function(){
	this.container = document.getElementById('setting_container');
	this.entitySetting = new EntitySetting(this);
	this.currentNode = null;
}




SettingManager.prototype = {
	load : function(node){
		if(this.currentNode == node) return;
		this.currentNode = node;
		if(node.entity){
			this.entitySetting.setNode(node);
			if(this.entitySetting.isInited === false) this.entitySetting.init();
			else this.entitySetting.reload();
		}
	}
}



var EntitySetting = function(settingManager){
	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElements = [];
	this.node = null;

}

EntitySetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('entity_setting').content;
		var inputElements = settingPanel.querySelectorAll('[data-bind]');
		this.inputElements = inputElements;
		// var dom = document.importNode(settingPanel, true);
		this.settingManager.container.appendChild(settingPanel);

		for(var i in inputElements){
			var inputElement = inputElements[i];
			if(inputElement.tagName){

				this.setElement(inputElement);
			}
		}
		this.isInited = true;
	},
	reload :function(){
		var inputElements = this.inputElements;
		for(var i in inputElements){
			var inputElement = inputElements[i];
			if(inputElement.tagName){

				this.setElement(inputElement);
			}
		}
	},
	setElement : function(input){
		var self = this;
		var bind = input.getAttribute('data-bind');
		var properties = bind.split('.');
		var key,key2;
		var position,rotation,scale;
		if(properties[0]){
			key = properties[0];
			if(key == 'name'){
				input.value = this.node.entity.name;
			}else if(key == 'enabled'){
				input.checked = this.node.entity.enabled;
			}else if(properties[1]){
				key2 = properties[1];
				if(key == 'scale'){
					scale = this.node.entity.getLocalScale();
					input.value = scale[key2];
				}else if(key == 'rotation'){
					rotation = this.node.entity.getLocalRotation();
					input.value = rotation[key2] * 180;
				}else if(key == 'position'){
					position = this.node.entity.getLocalPosition();
					input.value = position[key2];
				}
			}
		}


		input.onchange =  function(e){
			console.log(e);
			if(key == 'name'){
				self.node.entity.name = input.value;
				self.node.entity.fire('changeName');
			}else if(key == 'enabled'){
				self.node.entity.enabled = input.checked;
			}else if(properties[1]){
				key2 = properties[1];
				if(key == 'scale'){
					scale[key2] = input.value;
					self.node.entity.setLocalScale(scale);
				}else if(key == 'position'){
					position[key2] = input.value;
					self.node.entity.setLocalPosition(position);
				}else if(key == 'rotation'){
					var value = parseFloat(input.value)/180;
					rotation[key2] = value;
					self.node.entity.setLocalRotation(rotation);

				}
			}
		};
		// var property = this.entity;
		// while(properties.length > 0){
		// 	var key = properties.shift();
		// 	property = property[key];
		// 	if(property === undefined) return;
		// }

		
	},

	setNode : function(node){
		this.node = node;
	}
}