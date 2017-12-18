var Texture = function(editor, opts){
	this.editor = editor;
	var self = this;
	var name,format;
	var image = new Image();
	if(opts.texture instanceof pc.Texture){
			texture = opts.texture;	
	}else{
		if(opts.data){
			image.src = opts.data;
			name = opts.file.name;
			format = (opts.file.type == 'image/jpeg' || opts.file.type == 'image/jpg') ? pc.PIXELFORMAT_R8_G8_B8 : pc.PIXELFORMAT_R8_G8_B8_A8;
			image.onload = function(){
				self.texture = new pc.Texture(editor.app.graphicsDevice, {
					width: image.naturalWidth,
	                height: image.naturalHeight,
	                format: format
				});
				self.texture.setSource(image);
			}

		}else if(opts.url){
			image.src = opts.url;
			name = opts.name;
			format = new RegExp("\.jpg$").test(name) ? pc.PIXELFORMAT_R8_G8_B8 : pc.PIXELFORMAT_R8_G8_B8_A8;
			image.onload = function(){
				self.texture = new pc.Texture(editor.app.graphicsDevice, {
					width: image.naturalWidth,
	                height: image.naturalHeight,
	                format: format
				});
				self.texture.setSource(image);
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
	// this.texture = texture;

	this.dom.addEventListener('click', function(){
		if(self.editor.setTexture){
			editor.setTexture(self.texture);
		}
	});

	this.type = 'texture';
}