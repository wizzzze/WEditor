
var MaterialSetting = function(settingManager){

	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElements = [];
	this.node = null;
	this.isMounted = false;

	this.settingRow = document.getElementById('material_setting_row').content;
}

MaterialSetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('materials_setting').content;
		this.materialContainer = settingPanel.querySelector('.setting_panel_body');

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

		this.materialContainer.innerHTML = "";
		var meshInstances = this.node.entity.model.meshInstances;
		for(var i = 0; i < meshInstances.length;i++){
			this.setElement(meshInstances[i]);
		}
	},
	setElement : function(meshInstance){
		var self = this;
		var settingRow = this.settingRow.cloneNode(true);
		console.log(settingRow.children);
		var nodeName = settingRow.querySelector('span');
		nodeName.innerText = meshInstance.node.name;

		var edit = settingRow.querySelector('a[data-action="edit_material"]');
		var remove = settingRow.querySelector('a[data-action="remove_material"');
		
		var material = settingRow.querySelector('.select');
		if(material == pc.Scene.defaultMaterial){
			material.innerText = 'Empty';
		}else
			material.innerText = meshInstance.material.name;
		console.log(meshInstance.material);
		material.onclick = function(){
			alert('select');
		};

		this.materialContainer.appendChild(settingRow);
	},

	setNode : function(node){
		this.node = node;
	},

	remove : function(){
		this.settingManager.container.removeChild(this.settingPanel);
		this.isMounted = false;
	}
};