var Texture = function(device, opts){
	var texture,name;
	var image = new Image();
	if(opts.texture instanceof pc.Texture){
			texture = opts.texture;	
	}else{
		if(opts.data){
			
			image.src = opts.data;
			name = opts.file.name;
			var format = (opts.file.type == 'image/jpeg' || opts.file.type == 'image/jpg') ? pc.PIXELFORMAT_R8_G8_B8 : pc.PIXELFORMAT_R8_G8_B8_A8;
			image.onload = function(){
				texture = new pc.Texture(device, {
					width: image.naturalWidth,
	                height: image.naturalHeight,
	                format: format
				});
				texture.setSource(image);
			}

		}
	}
	var fragment = document.getElementById('texture_tpl').content;
	console.log(fragment);
	var item = fragment.cloneNode(true);
	item.querySelector('.file_preview').appendChild(image);
	item.querySelector('.file_name').innerText = name;

	this.dom = document.createElement('div');
	this.dom.appendChild(item);
	this.texture = texture;


}