var SettingManager = function(){
	this.container = document.getElementById('setting_container');
	this.entitySetting = new EntitySetting(this);
	this.modelSetting = new ModelSetting(this);
	this.materialSetting = new MaterialSetting(this);
	this.lightSetting = new LightSetting(this);
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
		}else{
			this.entitySetting.remove();
		}

		if(node.entity.model){
			this.modelSetting.setNode(node);
			if(this.modelSetting.isInited === false) this.modelSetting.init();
			this.modelSetting.reload();
		}else{
			this.modelSetting.remove();
		}

		if(node.entity.model && node.entity.model.meshInstances && node.entity.model.meshInstances.length > 0){
			this.materialSetting.setNode(node);
			if(this.materialSetting.isInited === false) this.materialSetting.init();
			this.materialSetting.reload();
		}else{
			this.materialSetting.remove();
		}
	}
}



