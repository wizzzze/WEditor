var FolderSetting = function(settingManager){
	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElement = null;
	this.node = null;

	this.isMounted = false;
}


FolderSetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('folder_setting').content;
		var inputElement = settingPanel.querySelector('[data-bind]');
		this.inputElement = inputElement;
		this.settingPanel = settingPanel;
		this.settingManager.container.appendChild(settingPanel);
		this.isMounted = true;
		this.settingPanel = this.settingManager.container.lastElementChild;

		this.isInited = true;
	},


	reload :function(){
		if(this.isMounted === false){
			this.settingManager.container.appendChild(this.settingPanel);
			this.isMounted = true;
		}
		this.inputElement.value = this.node.name;
		this.bindEvent();
		
	},
	bindEvent : function(){
		var self = this;
		this.inputElement.addEventListener('change', function(){
			self.node.setName(this.value);
		})
	},

	setNode : function(node){
		this.node = node;
	},
	remove : function(){
		if(this.isMounted){
			this.settingManager.container.removeChild(this.settingPanel);
			this.isMounted = false;
		}
	}
}