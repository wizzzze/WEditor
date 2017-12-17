var Material = function(opts){
	var material;
	if(opts.material){
		if(opts.material instanceof pc.Material){
			material = opts.material;
		}else{
			material = new pc.StandardMaterial();
		}
	}else{
		material = Editor.defaultMaterial.clone();
	}

	this.material = material;
}