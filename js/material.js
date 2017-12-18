var Material = function(opts){
	var material;
	if(opts && opts.material){
		if(opts.material instanceof pc.Material){
			material = opts.material;
		}else{
			material = new pc.StandardMaterial();
		}
	}else{
		material = Editor.defaultMaterial.clone();
		material.name = 'New Material';
	}

	this.material = material;

	
	
}