var MaterialSetting = function(settingManager){
	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElements = [];
	this.node = null;

	this.isMounted = false;
};

MaterialSetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('material_setting').content;
		var inputElements = settingPanel.querySelectorAll('[data-bind]');
		this.diffuseMapBtn = settingPanel.querySelector('.select');
		this.inputElements = inputElements;
		this.settingPanel = settingPanel;
		this.settingManager.container.appendChild(settingPanel);
		this.isMounted = true;
		this.settingPanel = this.settingManager.container.lastElementChild;

		this.isInited = true;
	},
	reload :function(){
		var self = this;
		if(this.isMounted === false){
			this.settingManager.container.appendChild(this.settingPanel);
			this.isMounted = true;
		}
		// var inputElements = this.inputElements;
		// for(var i in inputElements){
		// 	var inputElement = inputElements[i];
		// 	if(inputElement.tagName){

		// 		// this.setElement(inputElement);
		// 	}
		// }

		this.diffuseMapBtn.onclick = function(){
			self.settingManager.editor.assetManager.enableEditorMask(function(){
				var filter = new Filter(['texture']);
				self.settingManager.editor.assetManager.setFilter(filter);
				self.settingManager.editor.setTexture = function(texture){
					console.log(texture);

					console.log(self.node.material.diffuseMap);
					self.node.material.diffuseMap = texture;
					console.log(self.node.material.diffuseMap);
					self.node.material.update();
					console.log(self.node.material);
					self.reload();
					self.settingManager.editor.assetManager.disableEditorMask();
					self.settingManager.editor.assetManager.removeFilter();
					self.settingManager.editor.setMaterial = null;

				}
			});
		}
	},
	setNode : function(node){
		console.log(node);
		this.node = node;
	},

	remove : function(){
		if(this.isMounted){
			this.settingManager.container.removeChild(this.settingPanel);
			this.isMounted = false;
		}
	}
};