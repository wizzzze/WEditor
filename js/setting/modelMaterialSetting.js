
var ModelMaterialSetting = function(settingManager){

	this.settingManager = settingManager;
	this.isInited = false;
	this.inputElements = [];
	this.node = null;
	this.isMounted = false;

	this.settingRow = document.getElementById('model_material_setting_row').content;
}

ModelMaterialSetting.prototype = {
	init : function(){
		var settingPanel = document.getElementById('model_materials_setting').content;
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

		var nodeName = settingRow.querySelector('span');
		nodeName.innerText = meshInstance.node.name;

		var edit = settingRow.querySelector('a[data-action="edit_material"]');
		var remove = settingRow.querySelector('a[data-action="remove_material"');
		
		var material = settingRow.querySelector('.select');
		if(!meshInstance.material){
			material.innerText = 'Empty';
		}else if(meshInstance.material == pc.Scene.defaultMaterial){
			material.innerText = 'Empty';
		}else
			material.innerText = meshInstance.material.name;

		var dom = document.createElement('div');
		dom.appendChild(settingRow);

		material.onclick = function(){
			self.settingManager.editor.assetManager.enableEditorMask(function(){
				var filter = new Filter(['material']);
				self.settingManager.editor.assetManager.setFilter(filter);
				self.settingManager.editor.setMaterial = function(material){
					meshInstance.material = material;
					self.reload();
					self.settingManager.editor.assetManager.disableEditorMask();
					self.settingManager.editor.assetManager.removeFilter();
					self.settingManager.editor.setMaterial = null;

				}
			});
		};

		this.materialContainer.appendChild(dom);
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
};