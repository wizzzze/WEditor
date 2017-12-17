
var ModelSetting = function(settingManager){

	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElements = [];
	this.node = null;
	this.isMounted = false;
};

ModelSetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('model_setting').content;
		var inputElements = settingPanel.querySelectorAll('[data-bind]');
		this.inputElements = inputElements;
		this.settingManager.container.appendChild(settingPanel);
		this.isMounted = true;
		this.settingPanel = this.settingManager.container.lastElementChild;

		for(var i in inputElements){
			var inputElement = inputElements[i];
			if(inputElement.tagName){

				this.setElement(inputElement);
			}
		}
		this.isInited = true;
	},
	reload :function(){
		if(this.isMounted === false){
			this.settingManager.container.appendChild(this.settingPanel);
			this.isMounted = true;
		}
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
		input.checked = this.node.entity.model[bind];
		
		input.onchange =  function(e){
			self.node.entity.model[bind] = input.checked;
		};

	},

	setNode : function(node){
		this.node = node;
	},

	remove : function(){
		this.settingManager.container.removeChild(this.settingPanel);
		this.isMounted = false;
	}
};