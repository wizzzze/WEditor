var Texture = function(opts){
	var texture;
	if(opts.texture){
		if(opts.texture instanceof pc.Texture){
			texture = opts.texture;
		}else{
			texture = new pc.StandardMaterial();
		}
	}else{
		texture = Editor.defaultMaterial.clone();
	}

	this.texture = texture;
}