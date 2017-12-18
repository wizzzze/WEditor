var SettingManager = function(editor){
	this.editor = editor;
	this.container = document.getElementById('setting_container');
	this.entitySetting = new EntitySetting(this);
	this.modelSetting = new ModelSetting(this);
	this.modelMaterialSetting = new ModelMaterialSetting(this);
	this.lightSetting = new LightSetting(this);

	this.folderSetting = new FolderSetting(this);

	this.materialSetting = new MaterialSetting(this);

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

			if(node.entity.model){
				this.modelSetting.setNode(node);
				if(this.modelSetting.isInited === false) this.modelSetting.init();
				this.modelSetting.reload();

				if(node.entity.model.meshInstances && node.entity.model.meshInstances.length > 0){
					this.modelMaterialSetting.setNode(node);
					if(this.modelMaterialSetting.isInited === false) this.modelMaterialSetting.init();
					this.modelMaterialSetting.reload();
				}else{
					this.modelMaterialSetting.remove();
				}

			}else{
				this.modelSetting.remove();
				this.modelMaterialSetting.remove();
			}

		}else{
			this.entitySetting.remove();
			this.modelSetting.remove();
			this.modelMaterialSetting.remove();
		}

		

		if(node instanceof Folder){
			this.folderSetting.setNode(node);
			if(this.folderSetting.isInited === false) this.folderSetting.init();
			this.folderSetting.reload();
		}else{
			this.folderSetting.remove();
		}

		if(node instanceof Material){
			this.materialSetting.setNode(node);
			if(this.materialSetting.isInited === false) this.materialSetting.init();
			this.materialSetting.reload();
		}else{
			this.materialSetting.remove();
		}
	},

	
}



