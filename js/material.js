var Material = function(editor, opts){
	var material;
	if(opts && opts.material){
		if(opts.material instanceof pc.Material){
			material = opts.material;
		}else{
			material = new pc.StandardMaterial();
		}
	}else{
		material = new pc.StandardMaterial();
		material.name = 'New Material';
	}

	this.material = material;

	var fragment = document.getElementById('material_tpl').content;
	console.log(fragment);
	var item = fragment.cloneNode(true);
	item.querySelector('.file_name').innerText = material.name;

	this.dom = document.createElement('div');
	this.dom.appendChild(item);
	this.type = 'material';
	var self = this;
	this.dom.addEventListener('click', function(){
		if(editor.setMaterial){
			editor.setMaterial(self.material);
		}else{
			editor.settingManager.load(self);
		}
	})
	
}