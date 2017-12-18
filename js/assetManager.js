var AssetManager = function(editor, folder, container){
	this.editor = editor;
	this.folder = document.getElementById(folder);
	this.folderScrollbar = new PerfectScrollbar(this.folder);
	this.container = document.getElementById(container);
	this.containerScrollbar = new PerfectScrollbar(this.container);

	this.root = new FolderNode(this, {
		dom : document.getElementById('folder_root'),
		name : '/',
	}); 
	this.currentSelectNode = this.root;

	this.textureReader = new FileReader();
	this.textureUploadInput;
	this.textureUploadInput = document.createElement('input');
	this.textureUploadInput.type = 'file';
	this.textureUploadInput.multiple = "multiple";
	this.textureUploadInput.onchange = function(){
		var files = this.files;;
		var i = 0;
		while(i < files.length){
			var file = files[i];
			self.textureHandler(file);
			i++;
		}

	};

	this.filter = null;

	this.textureUploadInput.accept = 'image/jpeg,image/png';

	this.initialize();

	this.uploadInput;
	this.queue = [];
	this.reader = new FileReader();

	var self = this;
	this.reader.onloadend = function(){
		self.handlerQueue();
	}
}
//模型、贴图数据使用fileReader读取，用户通过编辑器主动上传至服务器。

AssetManager.prototype = {
	folderMenu : function(){
		var self = this;
		return [
			{
				html : '<i class="fa fa-folder-o"></i>  Folder',
				callback : function(){
					self.add('folder');
				}
			},
			{
				html : '<i class="fa fa-cube"></i>  Model',
				callback : function(){
					self.add('model');
				}
			},
			{
				html : '<i class="fa fa-tint"></i>  Material',
				callback : function(){
					self.add('material');
				}
			},
			{
				html : '<i class="fa fa-image"></i>  Texture',
				callback : function(){
					self.add('texture');
				}
			},
		];
	},
	initialize : function(){
		var self = this;
		var folderHeader = document.createElement('div');
		folderHeader.innerHTML = '<div><i class="fa fa-chevron-circle-down" ></i> ASSETS</div>';
		folderHeader.classList.add('assets_hierarchy_header','panel_header');

		var folderToolbar = document.createElement('div');
		folderToolbar.classList.add('tool_bar');

		var folderAddBtn = document.createElement('a');
		folderAddBtn.innerHTML = '<i class="fa fa-plus"></i>';
		folderToolbar.appendChild(folderAddBtn);

		folderAddBtn.addEventListener('click', function(event){
			event.stopPropagation();
			var target = event.target;
			self.editor.menuManager.createMenu(self.folderMenu(), folderAddBtn, {
				cache : true,
			});
		})

		var folderRemoveBtn = document.createElement('a');
		folderRemoveBtn.innerHTML = '<i class="fa fa-trash"></i>';
		folderToolbar.appendChild(folderRemoveBtn);

		var folderThBtn = document.createElement('a');
		folderThBtn.innerHTML = '<i class="fa fa-th"></i>';
		folderToolbar.appendChild(folderThBtn);

		var folderThLargeBtn = document.createElement('a');
		folderThLargeBtn.innerHTML = '<i class="fa fa-th-large"></i>';
		folderToolbar.appendChild(folderThLargeBtn);

		var folderSearch = document.createElement('div');
		folderSearch.classList.add('header_input');
		folderSearch.innerHTML = '<input type="text" placeholder="Search"><i class="fa fa-search"></i>';
		folderToolbar.appendChild(folderSearch);


		var modelLibary = document.createElement('a');
		modelLibary.innerHTML = '<i class="fa fa-cube"></i>  Models';
		folderToolbar.appendChild(modelLibary);

		var materialLibary = document.createElement('a');
		materialLibary.innerHTML = '<i class="fa fa-tint"></i>  Materials';
		folderToolbar.appendChild(materialLibary);

		folderHeader.appendChild(folderToolbar);

		document.querySelector('.center_bottom_panel').appendChild(folderHeader);
	},
	setData : function(data){
		if(this.data !== data){
			this.data = data;
			this.genNode(data, this.root);
		}
	},
	genNode : function(data ,currentNode){
		for(var i in data){
			var item = data[i];
			if(item.type === 'folder'){
				var node = new FolderNode(this, {name : item.name});
				currentNode.add(node);
				if(item.children){
					this.genNode(item.children, node);
				}
			}else if(item.type === 'material'){
				// var material = 
			}else if(item.type === 'texture'){
				var texture = new Texture(this.editor,{
					name : item.name,
					url : item.url,
				});
				currentNode.addFile(texture);
			}else if(item.type === 'model'){
				
			}

		}
	},
	genFile : function(){

	},

	add : function(type){
		var self  = this;
		if(type == 'folder'){
			var node = new FolderNode(this);
			this.currentSelectNode.add(node);
		}else if(type == "material"){
			var material = new Material(this.editor);
			this.currentSelectNode.addFile(material);
			return;
		}else if(type == 'texture'){
			this.textureUploadInput.click();
		}else if(type == 'model'){
			if(!this.uploadInput){
				this.uploadInput = document.createElement('input');
				this.uploadInput.type = 'file';
				this.uploadInput.multiple = "multiple";
				this.uploadInput.onchange = function(){
					var files = this.files;;
					var i = 0;
					while(i < files.length){
						var file = files[i];
						self.queue.push(file);
						i++;
					}

					self.handlerQueue();
				};
			}else{
				this.uploadInput.files.length = 0;
				this.uploadInput.accept = '';
			}

			this.uploadInput.click();
		}

		this.editor.menuManager.destroyMenu();
	},

	showChildren : function(){
		var children = this.currentSelectNode.children;
		console.log(children);
		this.container.innerHTML = '';
		for(var i in children){
			var child = children[i];
			if(this.filter && !this.filter.test(child)){
				continue;
			}
			this.container.appendChild(child.dom);
		}
	},

	setFilter : function(filter){
		this.filter = filter;
		this.showChildren();
	},
	removeFilter : function(){
		this.filter = null;
		this.showChildren();
	},
	handlerQueue : function(){
		var file = this.queue.shift();
		if(!file){
			return;
		}
		var fileName = file.name;
		var ext = (fileName.split('.')).pop();
		if(ext.toLowerCase() == 'fbx'){
			var model = this.readFbxFile(file);
		}else if(ext.toLowerCase() == 'obj'){
			var model = ObjReader(file, this.reader);
		}else if(ext.toLowerCase() == 'png'){

		}else if(ext.toLowerCase() == 'jpg'){

		}
	},

	readFbxFile : function(file){
		this.reader.readAsArrayBuffer(file);
		this.reader.onprogress = function(progress){
			console.log(progress);
		};
		this.reader.onload = function(data){
			var arrayBuffer = data.target.result;
			var model = new FbxReader(arrayBuffer);
		};
		this.reader.onerror = function(e){
			console.log(e);
		}

	},
	textureHandler : function(file){
		var self = this;
		this.textureReader.readAsDataURL(file);
		this.textureReader.onload = function(data){
			var texture = new Texture(self.editor,{
				name : file.name,
				file : file,
				data : data.target.result,
			});
			self.currentSelectNode.addFile(texture);
		}

	},
	enableEditorMask : function(callback){
		this.editor.mask.style.display = 'block';
		document.querySelector('.center_bottom_panel').style.zIndex=101;
		callback();
	},
	disableEditorMask : function(){
		this.editor.mask.style.display = 'none';
		document.querySelector('.center_bottom_panel').style.zIndex= 'auto';

	}
}




var FolderNode = function(manager, opts){
	var self = this;
	var dom;
	this.name = opts && opts.name ?opts.name:'New Folder';
	if(opts && opts.dom){
		dom = opts.dom;
	}else{
		dom = document.createElement('li');
		dom.innerHTML = "<div><i class='fa fa-folder'></i>  "+this.name+"</div>";
	}

	this.dom = dom;
	this.manager = manager;
	var childNodes = dom.childNodes;

	this.childContainer = null;
	for(var i in childNodes){
		var child = childNodes[i];
		if(child.tagName == 'DIV'){
			this.eventDom = child;
		}else if(child.tagName == "UL"){
			this.childContainer = child;
		}
	}

	this.nameNode = this.eventDom.childNodes[1];

	this.eventDom.addEventListener('click', function(e){
		self.select();
	});

	this.hasChildFolder = false;
	this.children = [];

};


FolderNode.prototype = {
	setName : function(name){
		var self = this;
		this.name = name;
		this.nameNode.textContent = this.name;
		console.log(this.eventDom);
		this.eventDom.addEventListener('click', function(e){
			self.select();
		});
	},
	add : function(node){
		if(! node instanceof FolderNode){
			console.error('node must be instanceof FolderNode');
		}

		if(this.childContainer === null){
			this.childContainer = document.createElement('ul');
			this.childContainer.classList.add('folder_list');
			this.dom.appendChild(this.childContainer);
			this.dom.classList.add('has_child');
		}
		this.childContainer.appendChild(node.dom);
		var folder = new Folder(this.manager.editor, node);
		this.children.push(folder);
		if(this == this.manager.currentSelectNode){
			this.manager.container.appendChild(folder.dom);
		}
	},
	select : function(){
		this.manager.currentSelectNode.eventDom.classList.remove('selected');
		this.eventDom.classList.add('selected');
		this.manager.currentSelectNode = this;
		this.manager.showChildren();
	},
	addFile : function(file){
		this.children.push(file);
		this.manager.container.appendChild(file.dom);

	},
	setName : function(newName){
		this.dom.innerHTML = "<div><i class='fa fa-folder'></i>  "+ newName +"</div>";
	},
	remove : function(){

	}
};


var Filter = function(opts){
	this.types = [];
	if(opts instanceof String){
		this.types = [opts];
	}else if(opts instanceof Array){
		this.types = opts;
	}else if(opts instanceof Object){
		//TODO::
	}
}

Filter.prototype = {
	test : function(item){
		var type = item.type;
		if(this.types.indexOf(type) >= 0){
			return true;
		}
		return false;
	}
}
